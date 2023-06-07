import { useFrame } from "@react-three/fiber";
import { ArchetypeBucket, Bucket, With } from "miniplex";
import { useOnEntityRemoved } from "miniplex/react";
import { Object3D, Vector3, Event } from "three";
import { EntityBucketContextProps } from "../providers/createEntityBucketProvider";
import { useContext } from "react";

export function getCellKeyFromPosition(x: number, y: number) {
  return `${Math.floor(x)}|${Math.floor(y)}`;
}

export type EntityBucketProviderProps<
  E extends { transform?: Object3D<Event>; spatialHashing?: boolean }
> = {
  entities: ArchetypeBucket<With<E, "transform" | "spatialHashing">>;
  context: React.Context<EntityBucketContextProps<E>>;
};

export const createSpatialHashingSystem = <
  E extends { transform?: Object3D<Event>; spatialHashing?: boolean }
>() => {
  const SpatialHashingSystem: React.FC<EntityBucketProviderProps<E>> = ({
    entities,
    context,
  }) => {
    const { entityBucket, entityCellBucket } = useContext(context);
    /*
    When an entity is removed, make sure it is also removed from
    the spatial hashing grid.
    */
    useOnEntityRemoved(entities, (entity: E) =>
      entityCellBucket.get(entity)?.remove(entity)
    );

    useFrame(() => {
      for (const entity of entities) {
        /* Determine the entity's current cell */
        const p = entity.transform!.position;
        const key = getCellKeyFromPosition(p.x, p.y);

        let cell = entityBucket.get(key);

        /* Make sure the cell is initialized */
        if (!cell) {
          cell = new Bucket<E>();
          entityBucket.set(key, cell);
        }

        /* If the entity has moved cells, update the spatial hash */
        const current = entityCellBucket.get(entity);
        if (current !== cell) {
          /* Remove the entity from its previous cell */
          current?.remove(entity);

          /* Add the entity to its new cell */
          cell.add(entity);
          entityCellBucket.set(entity, cell);
        }
      }
    });

    return null;
  };

  const getEntitiesInRadius = <E extends Object>(
    cells: Map<string, Bucket<E>>,
    p: Vector3,
    r: number,
    max = Infinity,
    out?: E[]
  ) => {
    const entities = out || [];
    entities.length = 0;

    for (let i = -r; i <= r; i++) {
      for (let j = -r; j <= r; j++) {
        const cell = cells.get(getCellKeyFromPosition(p.x + i, p.y + j));

        if (cell) {
          entities.push(...cell);
          if (entities.length >= max) return entities;
        }
      }
    }

    return entities;
  };

  return { SpatialHashingSystem, getEntitiesInRadius };
};
