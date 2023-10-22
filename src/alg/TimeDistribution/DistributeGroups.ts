import { Group } from "../../Class/Groups";
import { PriorityQueue } from "../../Class/PriorityQueue";
import Item from "../../types/Item";
import { Path } from "../../types/Path";

const MAX_ITERATIONS = 2000;
let counter = 0;
let failed = false;

function createRecordOfCurrentUsedCapacity(
  paths: Path[]
): Record<string, number> {
  const record: Record<string, number> = {};
  paths.forEach((path) => {
    path.path.forEach((pathItem) => {
      record[pathItem] =
        (record[pathItem] || 0) + path.valueForTestingStudentDistribution;
    });
  });
  return record;
}

function checkForExceedingGroupCapacities(paths: Path[], items: Item[]): void {
  const record = createRecordOfCurrentUsedCapacity(paths);
  items.forEach((item) => {
    if (record[item._id] > item.groupCapazity) {
      redistribute(
        item._id,
        record[item._id] - item.groupCapazity,
        items,
        paths
      );
    }
  });
}
function distributeStudentsToPaths(
  pq: PriorityQueue<Group>,
  items: Item[],
  paths: Path[]
): void {
  while (!pq.isEmpty()) {
    const group = pq.dequeue();
    let amountStudentsRemaining = group.studentIds.length;

    paths.forEach((path) => {
      if (path.groupId === group._id && amountStudentsRemaining > 0) {
        const min = Math.min(
          path.groupCapacity - path.valueForTestingStudentDistribution,
          amountStudentsRemaining
        );

        amountStudentsRemaining -= min;
        path.valueForTestingStudentDistribution
          ? (path.valueForTestingStudentDistribution = min)
          : (path.valueForTestingStudentDistribution += min);
      }
    });
  }

  checkForExceedingGroupCapacities(paths, items);
}

function redistribute(
  failedId: string,
  excessStudents: number,
  items: Item[],
  paths: Path[]
): void {
  paths.forEach((path) => {
    const alternativePaths = paths.filter(
      (pathItem) =>
        pathItem.groupId === path.groupId && !pathItem.path.includes(failedId)
    );

    const failedGroupPaths = paths.filter(
      (pathItem) =>
        pathItem.groupId === path.groupId && pathItem.path.includes(failedId)
    );

    if (failedGroupPaths.length !== 0 && excessStudents !== 0) {
      failedGroupPaths.sort(
        (a, b) =>
          b.valueForTestingStudentDistribution -
          a.valueForTestingStudentDistribution
      );

      failedGroupPaths.forEach((failedPath) => {
        const removeCount =
          failedPath.valueForTestingStudentDistribution - excessStudents;
        failedPath.valueForTestingStudentDistribution = removeCount;

        let remainingExcessStudentsCount = excessStudents;

        alternativePaths.forEach((alternativePath) => {
          alternativePath.valueForTestingStudentDistribution +=
            remainingExcessStudentsCount;
          remainingExcessStudentsCount = 0;
        });

        excessStudents = remainingExcessStudentsCount;
      });
    }
  });

  counter++;
  if (counter > MAX_ITERATIONS) {
    failed = true;
  } else {
    checkForExceedingGroupCapacities(paths, items);
  }
}

export { distributeStudentsToPaths };
