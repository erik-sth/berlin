import { main } from "../src/alg/TimeDistribution";
import {
  findItemsByStudentId,
  getDefaultIds,
  getVotingIds,
} from "../src/alg/TimeDistribution/Utils";
import { items, polls, students, project } from "./data";

describe("Time Distribution Algorithm", () => {
  const allocationResult = main(items, students, project, polls);

  it("should allocate the correct number of items to each student", () => {
    const requiredIdsLength = getDefaultIds(project).length;

    students.forEach((student) => {
      const studentId = student._id;
      const itemsForStudent = findItemsByStudentId(studentId, allocationResult);
      const expectedItemCount =
        requiredIdsLength + getVotingIds(studentId, polls).length;

      expect(itemsForStudent.length).toBe(expectedItemCount);
    });
  });

  it("should allocate items with the correct IDs to each student", () => {
    students.forEach((student) => {
      const studentId = student._id;
      const itemsForStudent = findItemsByStudentId(studentId, allocationResult);
      const expectedItemIds = [
        ...getDefaultIds(project),
        ...getVotingIds(studentId, polls),
      ];

      expect(itemsForStudent.map((item) => item.eventId)).toEqual(
        expect.arrayContaining(expectedItemIds)
      );
    });
  });
  it("should have only the allowed group size of students", () => {
    items.forEach((item) => {
      expect(item.studentIds.length).toBeLessThanOrEqual(item.groupCapazity);
    });
  });

  it("should not have overlapping events and not exceed group size limits", () => {
    students.forEach((student) => {
      const studentId = student._id;
      const itemsForStudent = findItemsByStudentId(studentId, allocationResult);

      expect(itemsForStudent.length).toBeGreaterThan(0);

      for (let i = 0; i < itemsForStudent.length; i++) {
        for (let j = i + 1; j < itemsForStudent.length; j++) {
          const itemA = itemsForStudent[i];
          const itemB = itemsForStudent[j];
          const overlap =
            itemA.startTime < itemB.endTime && itemA.endTime > itemB.startTime;

          expect(overlap).toBe(false);
        }

        const groupEvents = itemsForStudent.filter(
          (otherItem) =>
            otherItem.eventId === itemsForStudent[i].eventId &&
            otherItem !== itemsForStudent[i]
        );
        const groupSize = itemsForStudent[i].groupCapazity;
        const studentsInGroup = groupEvents.reduce(
          (total, groupEvent) => total + groupEvent.studentIds.length,
          0
        );

        expect(studentsInGroup).toBeLessThanOrEqual(groupSize);
      }
    });
  });
});
