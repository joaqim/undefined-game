import { getDiceRollFromRotation } from "../src/game//util/getDiceRollFromRotation";
import { Euler } from "three";
import { expect } from "chai";

describe("getDiceRollFromRotation", () => {
  it("should return the correct dice result for various rotations", () => {
    // Test case 1: Upwards orientation
    let rotation1 = new Euler(0, 0, 0);
    expect(getDiceRollFromRotation(rotation1)).to.equal(1);

    let rotation2 = new Euler(0, 0, 90);
    expect(getDiceRollFromRotation(rotation2)).to.equal(2);

    let rotation3 = new Euler(-90, 0, 0);
    expect(getDiceRollFromRotation(rotation3)).to.equal(3);

    let rotation4 = new Euler(90, 0, 0);
    expect(getDiceRollFromRotation(rotation4)).to.equal(4);

    let rotation5 = new Euler(0, 0, -90);
    expect(getDiceRollFromRotation(rotation5)).to.equal(5);

    let rotation6 = new Euler(180, 0, 0);
    expect(getDiceRollFromRotation(rotation6)).to.equal(6);
  });

  it("should return null for undetermined orientation ", () => {
    // Test case: Udetermined rotation
    let rotation1 = new Euler(12, 50, 10);
    expect(getDiceRollFromRotation(rotation1)).to.equal(null);

    // Test case: Can use threshold of acceptable Degree
    expect(getDiceRollFromRotation(rotation1, 30)).to.not.equal(null);
  });
});
