import { Groups, Group } from "../Class/Groups";

describe("Groups class", () => {
  let groups: Groups;

  beforeEach(() => {
    groups = new Groups();
  });

  test("should add a student to an existing group", () => {
    const path = ["A", "B", "C"];
    const studentId = "123";

    groups.add(path, studentId);

    const expectedGroup: Group = { path, studentIds: [studentId], id: 1 };
    expect(groups.getAll()).toEqual([expectedGroup]);
  });

  test("should create a new group if path doesn't exist", () => {
    const path1 = ["A", "B", "C"];
    const path2 = ["X", "Y", "Z"];
    const studentId1 = "123";
    const studentId2 = "456";

    groups.add(path1, studentId1);
    groups.add(path2, studentId2);

    const expectedGroups: Group[] = [
      { path: path1, studentIds: [studentId1], id: 1 },
      { path: path2, studentIds: [studentId2], id: 2 },
    ];
    expect(groups.getAll()).toEqual(expectedGroups);
  });

  test("should get a group by path", () => {
    const path = ["A", "B", "C"];
    const studentId = "123";

    groups.add(path, studentId);

    const retrievedGroup = groups.get(path);

    const expectedGroup: Group = { path, studentIds: [studentId], id: 1 };
    expect(retrievedGroup).toEqual(expectedGroup);
  });

  test("should return undefined when getting a non-existing group", () => {
    const path = ["X", "Y", "Z"];

    const retrievedGroup = groups.get(path);

    expect(retrievedGroup).toBeUndefined();
  });
});