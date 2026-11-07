// Section 05 — State as a state machine
//
// The whole app's state is ONE object. It only ever changes through
// transition(state, event), which returns a NEW state (or the SAME state
// when the event changes nothing). Never change `state` itself.

export const initialState = Object.freeze({
  status: "idle",       // "idle" | "loading" | "ready" | "error"
  courses: [],          // the courses from the last successful load
  error: null,          // the error message when status is "error"
  departments: [],      // every department name, sorted — filled by the first successful load
  department: "",       // the selected department filter ("" = all)
  query: "",            // the search box text
  planner: [],          // planned courses: { id, code, title, credits }
  grades: {},           // the SGPA calculator form: { [courseId]: "A" | "A-" | … }
});

export function transition(state, event) {
  switch (event.type) {
    case "LOAD_START":
      return {...state, status: "loading", error: null};

    case "LOAD_OK":
      {
        const departments = state.departments.length === 0 ? [...new Set(event.courses.map(course => course.department))].sort() : state.departments;
        return {...state, status: "ready", courses: event.courses, departments};
      }

    case "LOAD_FAIL":
      return {...state, status: "error", error: event.message};

    case "SET_DEPARTMENT":
      if (state.department === event.department) {
        return state;
      }
      return {...state, department: event.department};

    case "SET_QUERY":
      if (state.query === event.query) {
        return state;
      }
      return {...state, query: event.query};

    case "ADD": {
      const course = event.course;
      
      if(state.planner.some(item => item.id === course.id))
        return state;

      if(course.seatsLeft <= 0)
        return state;

      const currentCredits = state.planner.reduce( (total, item) => total + item.credits, 0); 

      if(currentCredits + course.credits > 24)
        return state;

      const plannedCourse = {
        id: course.id,
        code: course.code,
        title: course.title,
        credits: course.credits
      }

      return {...state, planner: [...state.planner, plannedCourse]};

    }

    case "REMOVE": {
      if(!state.planner.some(course => course.id === event.id))
        return state;

      const planner = state.planner.filter( course => course.id != event.id );

      const grades = {...state.grades};
      delete grades[event.id];

      return {...state, planner, grades};
    }

    case "SET_GRADE": {
      const {id, grade } = event;

      if(grade === "") {
        if(!id in state.grades)
          return state;

        const grades = {...state.grades};
        delete grades[id];

        return {...state, grades};
      }

      if(state.grades[id] === grade)
        return state;

      return {...state, grades: {...state.grades, [id]: grade}};
      
    }

    default:
      return state; // an event we don't know changes nothing
  }
}
