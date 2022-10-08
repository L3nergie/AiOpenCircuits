import {serializable} from "serialeazy";

import {V} from "Vector";

import {ClampedValue} from "math/ClampedValue";

import {PressableComponent} from "../PressableComponent";


@serializable("Switch")
export class Switch extends PressableComponent {

    /**
     * Initializes Switch with no input ports, a single output port, and predetermined sizes.
     */
    public constructor() {
        super(new ClampedValue(0),
              new ClampedValue(1),
              V(1.24, 1.54), V(0.96, 1.2));
    }

    /**
     * Toggles Switch.
     */
    public override click(): void {
        this.activate(!this.on);
    }

    /**
     * Activates or deactivates Switch output.
     *
     * @param signal Boolean representing on or off.
     */
    public override activate(signal: boolean): void {
        super.activate(signal, 0);
    }

    /**
     * Returns name of Component.
     *
     * @returns The string "Switch".
     */
    public getDisplayName(): string {
        return "Switch";
    }

    /**
     * Returns name of image file with on state Switch.
     *
     * @returns The string "switchUp.svg".
     */
    public getOffImageName(): string {
        return "switchUp.svg";
    }

    /**
     * Returns name of image file with off state Switch.
     *
     * @returns The string "switchDown.svg".
     */
    public getOnImageName(): string {
        return "switchDown.svg";
    }
}
