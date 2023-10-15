import { Group } from "../../Class/Groups";
import Item from "../../types/Item";
import { Path } from "../../types/Path";

function allocateGroupsToItems(
  paths: Path[],
  items: Item[],
  groups: Group[]
): void {
  paths.forEach((path) => {
    if (path.valueForDistributingOfStudents !== 0) {
      const groupId = path.groupId;
      const studentsCount = path.valueForDistributingOfStudents;

      const group = groups.find((group) => groupId === group.id);

      if (group) {
        const ids = Array.from({ length: studentsCount }, () =>
          group.studentIds.shift()
        );

        path.path.forEach((eventId) => {
          if (items.some((item) => item._id === eventId)) {
            const item = items.find((item) => item._id === eventId);
            if (item) {
              item.studentIds.push(...ids);
            }
          }
        });
      }
    }
  });
}

export { allocateGroupsToItems };