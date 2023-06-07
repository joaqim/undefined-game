import { between } from "randomish";
import { Color, Quaternion, Vector3 } from "three";
import { InstancedParticles, Particle } from "vfx-composer-r3f";
import { applyDamage, queueDestroy } from "../actions";
import { ECS, Entity, lifetime, PhysicsLayers } from "../state";
import { physics } from "../systems/PhysicsSystem";
import { bitmask } from "../../library/util/bitmask";
import { RenderableEntity } from "../../library/entities/RenderableEntity";
import type { With } from "miniplex";

export const Bullets = () => (
  <InstancedParticles>
    <planeGeometry args={[0.15, 0.5]} />
    <meshStandardMaterial color={new Color("orange").multiplyScalar(5)} />

    <ECS.Archetype with="isBullet" children={RenderableEntity} />
  </InstancedParticles>
);

const players = ECS.world.with("isPlayer");

type BulletSettings = {
  velocity?: number;
  damage?: number;
  maxAge?: number;

  fireDelay?: number;
  jitter?: number;
  axis?: Vector3;
};

type SpecialBulletsSettings = BulletSettings & {
  amount?: number;
  spread?: number;
};

export const SPECIAL_BULLETS: Record<string | number, SpecialBulletsSettings> =
  {
    // 3 spread, weak, slow, slightly focused
    1: {
      damage: 260,
      jitter: 0.04,
      spread: Math.PI * 0.15,
      maxAge: 2,
      amount: 3,
      velocity: 10,
      fireDelay: 160,
    },
    // Slow, hard hitting one-shot
    2: {
      damage: 370,
      jitter: 0.01,
      maxAge: 8,
      velocity: 15,
      fireDelay: 240,
    },
    // 5 spread, strong, fast, un-focused
    3: {
      damage: 280,
      jitter: 0.08,
      maxAge: 4,
      velocity: 20,
      fireDelay: 320,
      amount: 5,
      spread: Math.PI * 0.35,
    },
  } as const;

export const DEFAULT_BULLET: Required<BulletSettings> = {
  axis: new Vector3(0, 0, 1),
  damage: 270,
  maxAge: 2,
  jitter: 0.04,
  velocity: 25,
  fireDelay: 65,
} as const;

const createBullet = (
  player: With<Entity, "isPlayer">,
  angleOffset: number = 0,
  bulletSettings?: SpecialBulletsSettings
): Entity => {
  const { axis, jitter, maxAge, velocity, damage } = {
    ...DEFAULT_BULLET,
    ...bulletSettings,
  };

  const bulletAngle = new Quaternion().setFromAxisAngle(
    axis,
    angleOffset + between(-jitter, jitter)
  );

  const bullet = ECS.world.add({
    isBullet: true,
    ...lifetime(maxAge),

    physics: physics({
      velocity: new Vector3(0, velocity, 0)
        .applyQuaternion(player.transform!.quaternion)
        .applyQuaternion(bulletAngle)
        .add(player.physics!.velocity),
      radius: 0.1,
      restitution: 1,

      groupMask: bitmask(PhysicsLayers.Bullet),
      collisionMask: bitmask([PhysicsLayers.Asteroid]),

      onContactStart: (other) => {
        queueDestroy(bullet);
        applyDamage(other, damage);
      },
    }),

    spatialHashing: true,
    neighbors: [],

    render: (
      <ECS.Component name="transform">
        <Particle
          position={player.transform!.position}
          quaternion={player.transform!.quaternion}
        />
      </ECS.Component>
    ),
  });
  return bullet;
};

export const spawnSpecialBullets = (
  bulletSettings: SpecialBulletsSettings
): Entity[] | undefined => {
  const [player] = players;
  if (!player) return;

  const bullets: Entity[] = [];

  const { spread, amount } = { spread: 0, amount: 1, ...bulletSettings };

  if (amount <= 0) return;

  if (amount > 1) {
    const angleBetweenBullets = spread / (amount - 1);
    const startAngle = -spread / 2;

    for (let i = 0; i < amount; i++) {
      const angle = startAngle + i * angleBetweenBullets;
      const bullet = createBullet(player, angle, bulletSettings);
      bullets.push(bullet);
    }
  } else {
    bullets.push(createBullet(player, 0, bulletSettings));
  }

  return bullets;
};

export const spawnBullet = (): Entity | undefined => {
  const [player] = players;
  if (!player) return;

  return createBullet(player);
};
