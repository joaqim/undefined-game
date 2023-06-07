import { useFrame } from "@react-three/fiber";
import { ECS } from "../state";
import { EntityBucketContext, getEntitiesInRadius } from "../Systems";
import { useContext } from "react";

const entities = ECS.world.with(
  "transform",
  "physics",
  "neighbors",
  "spatialHashing"
);

export const FindNeighborsSystem = () => {
  const { entityBucket } = useContext(EntityBucketContext);

  useFrame(() => {
    for (const entity of entities) {
      /* If the body is sleeping, skip it */
      if (entity.physics.sleeping) continue;

      getEntitiesInRadius(
        entityBucket,
        entity.transform.position,
        Math.max(2, entity.physics.radius * 2),
        Infinity,
        entity.neighbors
      );
    }
  });

  return null;
};
