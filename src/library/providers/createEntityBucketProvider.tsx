import { Bucket } from "miniplex";
import { createContext, useState } from "react";

type EntityBucketMap<E extends Object> = Map<string, Bucket<E>>;
type EntityCellBucketMap<E extends Object> = WeakMap<E, Bucket<E>>;

export interface EntityBucketContextProps<E extends Object> {
  entityBucket: EntityBucketMap<E>;
  entityCellBucket: EntityCellBucketMap<E>;
  setEntityBucket: React.Dispatch<React.SetStateAction<EntityBucketMap<E>>>;
  setEntityCellBucket: React.Dispatch<
    React.SetStateAction<EntityCellBucketMap<E>>
  >;
}

export function createEntityBucketProvider<E extends Object>() {
  const EntityBucketContext = createContext<EntityBucketContextProps<E>>({
    entityBucket: new Map(),
    entityCellBucket: new WeakMap(),
    setEntityBucket: () => {},
    setEntityCellBucket: () => {},
  });

  const EntityBucketProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    const [entityBucket, setEntityBucket] = useState<EntityBucketMap<E>>(
      new Map()
    );
    const [entityCellBucket, setEntityCellBucket] = useState<
      EntityCellBucketMap<E>
    >(new WeakMap());

    return (
      <EntityBucketContext.Provider
        value={{
          entityBucket,
          entityCellBucket,
          setEntityBucket,
          setEntityCellBucket,
        }}
      >
        {children}
      </EntityBucketContext.Provider>
    );
  };

  return {
    EntityBucketContext,
    EntityBucketProvider,
  };
}
