import { DirectedGraph, GraphNode } from "../Class/Graph";
import Project from "../types/Project";
import Student from "../types/Student";
import Item from "../types/Item";
import PollQuestion from "../types/Polls";
import createGraph from "./CreateGraph";
import { Group, Groups } from "../Class/Groups";
import { PriorityQueue } from "../Class/PriorityQueue";

const EXTRA_IDS_CACHE = new Map<string, string[]>();

let items: Item[] = [];
let students: Student[] = [];
let polls: PollQuestion[] = [];
let project: Project = {} as Project;
let g: DirectedGraph<Item>;
let paths: Path[] = [];
interface Path {
  groupId: number;
  path: string[];
  maxSize: number;
  valueForDistributingOfStudents: number;
}

// O(1)
function getRequiredIdsForEveryone(): string[] {
  return project.requiredForAll;
}

const EMPTY_STRING = "";
// O(m*n) m = amount of polls n = amount of choices
function getExtraIds(studentId: string): string[] {
  if (EXTRA_IDS_CACHE.has(studentId)) {
    return EXTRA_IDS_CACHE.get(studentId)!;
  }

  const relevantPolls = polls
    .filter((poll) =>
      poll.choices.some(
        (choice) =>
          choice.studentIds.includes(studentId) &&
          choice.eventId !== EMPTY_STRING
      )
    )
    .flatMap((poll) =>
      poll.choices
        .filter(
          (choice) =>
            choice.studentIds.includes(studentId) &&
            choice.eventId !== EMPTY_STRING
        )
        .map((choice) => choice.eventId)
    );

  EXTRA_IDS_CACHE.set(studentId, relevantPolls);
  return relevantPolls;
}

function dfs(
  node: GraphNode<Item>,
  remainingIds: Set<string>,
  path: string[],
  extraIds: string[], // which ids are separate from the others
  groupId: number
): string[] | null {
  const REQUIRED_IDS_COPY = new Set(remainingIds);

  if (!REQUIRED_IDS_COPY.has(node.value.eventId)) {
    return null;
  }

  const newPath = [...path, node.value._id]; // create a new array instead of mutating
  remainingIds.delete(node.value.eventId);

  if (remainingIds.size === 0) {
    paths.push({
      groupId,
      path: newPath,
      maxSize: getSmallestGroupSize(newPath),
      valueForDistributingOfStudents: 0,
    });
  } else if (node.edges !== null) {
    node.edges.forEach((edge) =>
      dfs(edge, remainingIds, newPath, extraIds, groupId)
    );
  }

  remainingIds.add(node.value.eventId);
  return null;
}

function getSmallestGroupSize(path: string[]): number {
  return Math.min(
    ...items
      .filter((item) => path.includes(item._id))
      .map((item) => item.groupSize)
  );
}
function buildGroupsWithSamePaths() {
  const GROUPS = new Groups();
  students.forEach((student) => {
    GROUPS.add(getExtraIds(student._id), student._id);
  });
  return GROUPS.getAll();
}

function findAllPathsForEachGroup(groups: Group[]) {
  const REQUIRED_IDS: Set<string> = new Set<string>(
    getRequiredIdsForEveryone()
  );
  const ENTRIES = g.getNodesWithoutIngoingEdges();
  groups.forEach((group) => {
    const IDS: Set<string> = new Set([...REQUIRED_IDS, ...group.path]);
    ENTRIES.forEach((entry) => {
      dfs(entry, IDS, [], group.path, group.id);
    });
  });
}

function distributeStudentsToPaths(pq: PriorityQueue<Group>): void {
  while (!pq.isEmpty()) {
    const GROUP = pq.dequeue();
    let amountStudentsRemaining = GROUP.studentIds.length;
    paths.forEach((path) => {
      if (path.groupId === GROUP.id && amountStudentsRemaining > 0) {
        const MIN = Math.min(
          path.maxSize - path.valueForDistributingOfStudents,
          amountStudentsRemaining
        );
        amountStudentsRemaining -= MIN;
        path.valueForDistributingOfStudents
          ? (path.valueForDistributingOfStudents = MIN)
          : (path.valueForDistributingOfStudents += MIN);
      }
    });
  }

  checkForDuplicates(paths, items);
}
function redistribute(
  failedId: string,
  excessStudents: number,
  record: Record<string, number>
) {
  paths.forEach((path) => {
    const ALTERNATIVE_PATHS: Path[] = paths.filter(
      (pathItem) =>
        pathItem.groupId === path.groupId && !pathItem.path.includes(failedId)
    );

    const FAILED_GROUP_PATHS: Path[] = paths.filter(
      (pathItem) =>
        pathItem.groupId === path.groupId && pathItem.path.includes(failedId)
    );

    if (FAILED_GROUP_PATHS.length !== 0) {
      FAILED_GROUP_PATHS.sort(
        (a, b) =>
          b.valueForDistributingOfStudents - a.valueForDistributingOfStudents
      );

      FAILED_GROUP_PATHS.forEach((failedPath) => {
        const REMOVE_COUNT =
          failedPath.valueForDistributingOfStudents - excessStudents;

        failedPath.valueForDistributingOfStudents = REMOVE_COUNT;

        // Accumulate excess students without modifying it directly
        let remainingExcessStudentsCount = excessStudents;

        ALTERNATIVE_PATHS.forEach((alternativePath) => {
          alternativePath.valueForDistributingOfStudents +=
            remainingExcessStudentsCount;
          remainingExcessStudentsCount = 0; // Ensure it doesn't go below 0
        });

        // Update the original excessStudents value
        excessStudents = remainingExcessStudentsCount;
      });
    }
  });

  checkForDuplicates(paths, items);
}

function allocateItemsToStudents(
  paths: Path[],
  items: Item[],
  groups: Group[]
): void {
  paths.forEach((path) => {
    if (path.valueForDistributingOfStudents !== 0) {
      const GROUP_ID = path.groupId;
      const STUDENTS_COUNT = path.valueForDistributingOfStudents;

      const GROUP = groups.find((group) => GROUP_ID === group.id);

      if (GROUP) {
        const IDS = Array.from({ length: STUDENTS_COUNT }, () =>
          GROUP.studentIds.shift()
        );

        path.path.forEach((eventId) => {
          if (items.some((item) => item._id === eventId)) {
            const ITEM = items.find((item) => item._id === eventId);
            if (ITEM) {
              ITEM.studentIds.push(...IDS);
            }
          }
        });
      }
    }
  });
}
function createRecord(paths: Path[]): Record<string, number> {
  const RECORD: Record<string, number> = {};
  paths.forEach((path) => {
    path.path.forEach((pathItem) => {
      RECORD[pathItem] =
        (RECORD[pathItem] || 0) + path.valueForDistributingOfStudents;
    });
  });
  return RECORD;
}

function checkForDuplicates(paths: Path[], items: Item[]) {
  const RECORD: Record<string, number> = createRecord(paths);
  items.forEach((item) => {
    if (RECORD[item._id] > item.groupSize) {
      redistribute(item._id, RECORD[item._id] - item.groupSize, RECORD);
    }
  });
}

function countPathsByGroupId(paths: Path[]): Record<number, number> {
  const COUNT_BY_GROUP_ID: Record<number, number> = {};

  paths.forEach((path) => {
    const GROUP_ID = path.groupId;

    if (COUNT_BY_GROUP_ID[GROUP_ID]) {
      COUNT_BY_GROUP_ID[GROUP_ID]++;
    } else {
      COUNT_BY_GROUP_ID[GROUP_ID] = 1;
    }
  });

  return COUNT_BY_GROUP_ID;
}

function findItemsByStudentId(studentId: string, items: Item[]): Item[] {
  return items.filter((item) => item.studentIds.includes(studentId));
}

function createPQ(groups: Group[]): PriorityQueue<Group> {
  const PQ = new PriorityQueue<Group>();
  groups.forEach((group) => {
    PQ.enqueue(group, group.path.length);
  });
  return PQ;
}
// O(N^2 * M) estimated
function main(
  items1: Item[],
  students1: Student[],
  project1: Project,
  polls1: PollQuestion[]
): Item[] {
  items = items1;
  students = students1;
  project = project1;
  polls = polls1;
  paths = [];
  const GROUPS = buildGroupsWithSamePaths();
  g = createGraph(items);
  findAllPathsForEachGroup(GROUPS);
  const PQ = createPQ(GROUPS);
  distributeStudentsToPaths(PQ);
  allocateItemsToStudents(paths, items, GROUPS);
  return items1;
}

export { main, getExtraIds, getRequiredIdsForEveryone, findItemsByStudentId };
