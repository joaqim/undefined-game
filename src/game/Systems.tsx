import { Vector3 } from "three";
import { createSpatialHashingSystem } from "../library/systems/SpatialHashingSystem";
import { ECS, Entity } from "./state";
import { createEntityBucketProvider } from "../library/providers/createEntityBucketProvider";

export const { EntityBucketContext, EntityBucketProvider } =
  createEntityBucketProvider<Entity>();

export const { SpatialHashingSystem, getEntitiesInRadius } =
  createSpatialHashingSystem<Entity>();

export const Systems = () => {
  const entities = ECS.world.with("transform", "spatialHashing");

  return (
    <EntityBucketProvider>
      <SpatialHashingSystem entities={entities} context={EntityBucketContext} />
    </EntityBucketProvider>
  );
};
