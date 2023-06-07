import { Entity } from "../../game/state";

export const RenderableEntity = ({ render }: Pick<Entity, "render">) => render!;
