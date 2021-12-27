import {Create} from "serialeazy";

import {Formats} from "digital/utils/ExpressionParser/Constants/Formats";

import {AddGroupAction} from "core/actions/addition/AddGroupAction";
import {PlaceAction} from "core/actions/addition/PlaceAction";
import {GroupAction} from "core/actions/GroupAction";
import {CreateDeselectAllAction, SelectAction, CreateGroupSelectAction} from "core/actions/selection/SelectAction";

import {OrganizeMinDepth} from "core/utils/ComponentOrganizers";

import {CreateICDataAction} from "digital/actions/CreateICDataAction";

import {DigitalComponent} from "digital/models";
import {LED, ICData, IC, Clock} from "digital/models/ioobjects";
import {DigitalCircuitInfo} from "digital/utils/DigitalCircuitInfo";
import {ExpressionToCircuit} from "digital/utils/ExpressionParser";
import {GenerateTokens} from "digital/utils/ExpressionParser/GenerateTokens";
import {OperatorFormat} from "digital/utils/ExpressionParser/Constants/DataStructures";
import {CreateDeleteGroupAction} from "core/actions/deletion/DeleteGroupActionFactory";


export type InputTypes = "Button" | "Clock" | "Switch";

export function Generate(info: DigitalCircuitInfo, expression: string,
                         isIC: boolean, input: InputTypes, format: string,
                         ops: OperatorFormat) {
    // Set the operator format
    if (format !== "custom")
        ops = Formats.find(form => form.icon === format);

    // Create input tokens
    const tokenList = GenerateTokens(expression, ops);
    const inputMap = new Map<string, DigitalComponent>();
    for (const token of tokenList) {
        if (token.type !== "input" || inputMap.has(token.name))
            continue;
        inputMap.set(token.name, Create<DigitalComponent>(input));
        inputMap.get(token.name).setName(token.name);
    }

    // Create output LED
    const o = new LED();
    o.setName("Output");

    // Get the generated circuit
    const circuit = ExpressionToCircuit(inputMap, expression, o, ops);

    // Get the location of the top left corner of the screen, the 1.5 acts as a modifier
    //  so that the components are not literally in the uppermost leftmost corner
    const startPos = info.camera.getPos().sub(info.camera.getCenter().scale(info.camera.getZoom()/1.5));
    const action = new GroupAction([CreateDeselectAllAction(info.selections).execute(),
                                    new AddGroupAction(info.designer, circuit).execute()]);
    OrganizeMinDepth(circuit, startPos);

    if (isIC) { // If creating as IC
        const data = ICData.Create(circuit);
        if (!data)
            throw new Error("Failed to create ICData");
        data.setName(expression);
        const ic = new IC(data);
        ic.setName(expression);
        ic.setPos(info.camera.getPos());
        action.add(CreateDeleteGroupAction(info.designer, circuit.getComponents()).execute());
        action.add(new CreateICDataAction(data, info.designer).execute());
        action.add(new PlaceAction(info.designer, ic).execute());
        action.add(new SelectAction(info.selections, ic).execute());
    } else { // If placing directly
        action.add(CreateGroupSelectAction(info.selections, circuit.getComponents()).execute());
    }

    info.history.add(action);
    if (input === "Clock") {
        let inIndex = 0;
        for (let clock of inputMap.values() as IterableIterator<Clock>) {
            clock.setFrequency(500 * (2**Math.min(inIndex, 4)));
            inIndex++;
        }
    }
    info.renderer.render();
}

