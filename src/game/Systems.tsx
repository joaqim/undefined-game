import { Vector3 } from "three";
import { AgeSystem } from "./systems/AgeSystem";
import { AsteroidsSystem } from "./systems/AsteroidsSystem";
import { CameraRigSystem } from "./systems/CameraRigSystem";
import { DestroySystem } from "./systems/DestroySystem";
import { FindNeighborsSystem } from "./systems/findNeighborsSystem";
import { PhysicsSystem } from "./systems/PhysicsSystem";
import { PlayerSystem } from "./systems/PlayerSystem";
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
      <AgeSystem />
      <SpatialHashingSystem entities={entities} context={EntityBucketContext} />
      <FindNeighborsSystem />
      <PhysicsSystem />
      <PlayerSystem />
      <AsteroidsSystem />

      <CameraRigSystem offset={new Vector3(0, -20, 30)} />
      <DestroySystem />
    </EntityBucketProvider>
  );
};
