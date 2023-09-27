import { findItemsByStudentId, main } from "./alg/timeDistribution";
import { items } from "./data/Items";
import { students } from "./data/students";
import { polls } from "./data/Polls";
import { berlin } from "./data/Project";

console.time();
main(items, students, berlin, polls);
console.timeEnd();

// students.forEach((student) => {
//   console.log("\n" + student._id + ": ");
//   findItemsByStudentId(student._id, items).forEach((elemement) =>
//     console.log(elemement.eventId.length)
//   );
// });
students.forEach((student) => {
  const length = findItemsByStudentId(student._id, items).length;
  if (length != 0) return;
  console.log("\n" + student._id + ": " + length);
});
