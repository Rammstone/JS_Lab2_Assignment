// Section 06 — From state to screen: views
// Pure functions: state in, plain data describing the screen out. No DOM here.
// Nothing they return is ever stored in state — it's worked out fresh on every render.

// What one course card shows.
//   { id, heading, meta, seats, inPlanner, buttonLabel, disabled }
//   heading      "CS402 · Enterprise Software Development"
//   meta         "4 credits · Computer Science"
//   seats        "Full" | "1 seat left" | "12 seats left"
//   inPlanner    is this course already in the planner?
//   buttonLabel  "Remove" if in the planner, otherwise "Add"
//   disabled     true only for a FULL course that is NOT in the planner
export function cardView(course, planner) {
  
  const inPlanner = planner.some(item => item.id === course.id);

  let seats;

  if(course.seatsLeft === 0)
    seats = "Full";
  else if(course.seatsLeft === 1)
    seats = "1 seat left";
  else
    seats = `${course.seatsLeft} seats left`;

  return { id: course.id, heading: `${course.code} · ${course.title}`, meta: `${course.credits} credits · ${course.department}`,
           seats,
           inPlanner,
           buttonLabel: inPlanner ? "Remove" : "Add",
           disabled: course.seatsLeft <= 0 && !inPlanner
        };
}

// The planner summary.
//   { count, credits, overLimit, text }
//   text: "Nothing planned yet" | "1 course · 4 credits" | "3 courses · 10 credits"
//   overLimit: credits > 24
export function summaryView(planner) {
  const count = planner.length;

  const credits = planner.reduce( (total, course) => total + course.credits, 0);

  let text;

  if(count === 0)
    text = "Nothing planned yet";
  else
  {
    const courseWord = count === 1 ? "course" : "courses";
    text = `${count} ${courseWord} · ${credits} credits`;
  }

  return {count, credits, overLimit: credits > 24, text};

}

// The status line above the list.
//   { message, showRetry }
//   loading → "Loading courses…"
//   error   → `Couldn't load courses: ${state.error}`, with showRetry true
//   ready with no courses → "No courses match."
//   anything else → ""  (showRetry false except for errors)
export function statusView(state) {
  
  if (state.status === "loading")
    return {message: "Loading courses…", showRetry: false};

  if(state.status === "error")
    return {message: `Couldn't load courses: ${state.error}`, showRetry: true};

  if (state.status === "ready" && state.courses.length === 0)
    return{ message: "No courses match.", showRetry: false};

  return {message: "", showRetry: false};

}

// The SGPA calculator.
// Grade points on a 10-point scale:
export const GRADE_POINTS = Object.freeze({ A: 10, "A-": 9, B: 8, "B-": 7, C: 6, D: 5, F: 0 });

// SGPA = sum(credits × points) / sum(credits), over the planned courses that HAVE a grade.
//   { graded, total, credits, sgpa, text }
//   graded   how many planned courses have a grade
//   total    how many courses are planned
//   credits  the credits of the graded courses
//   sgpa     a number rounded to 2 decimals, or null when nothing is graded
//   text     "Add courses to the planner first"           (nothing planned)
//            "Pick a grade to see your SGPA"              (planned, none graded)
//            "SGPA 8.40 · 3 of 4 courses graded"           (some graded)
//            "SGPA 8.40"                                   (all graded)
//   (sgpa in text always shows 2 decimals: 9 → "9.00")
export function sgpaView(planner, grades) {
  
  const total = planner.length;

  if(total === 0)
    return { graded: 0, total: 0, credits: 0, sgpa: null, text: "Add courses to the planner first"};

  const gradedCourses = planner.filter(course => Object.hasOwn(GRADE_POINTS, grades[course.id]));

  const graded = gradedCourses.length;

  const credits = gradedCourses.reduce( (total, course) => total + course.credits, 0);

  if(graded === 0)
    return {graded, total, credits, sgpa: null, text: "Pick a grade to see your SGPA"};

  const weightedPoints = gradedCourses.reduce( (sum, course) => sum + course.credits * GRADE_POINTS[grades[course.id]], 0);

  const sgpa = Number((weightedPoints / credits).toFixed(2));

  const text = graded === total ? `SGPA ${sgpa.toFixed(2)}` : `SGPA ${sgpa.toFixed(2)} · ${graded} of ${total} courses graded`;

  return {graded, total, credits, sgpa, text};

}
