import { matchExpenseWindow } from "./windowMatcher.util.js";

const windows = [
  {
    name: "Food",
    labels: ["zomato", "swiggy", "restaurant"]
  },
  {
    name: "Travel",
    labels: ["uber", "ola", "auto"]
  },
  {
    name: "Bills",
    labels: ["electricity", "wifi", "internet"]
  }
];

const test = async () => {

  const note = "pompom";

  const result = await matchExpenseWindow(note, windows);

  console.log("Matched Window:", result);

};

test();