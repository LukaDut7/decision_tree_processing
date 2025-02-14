import express from "express";
import {
  DecisionTreeService,
  christmasDecisionTree,
  emailAndSmsTree,
  optionalMailsTree,
} from "./decisionTree";

console.log("=== Executing christmasDecisionTree ===");
DecisionTreeService.processDecisionTree(christmasDecisionTree, { date: "1.1.2025" });

console.log("\n=== Executing emailAndSmsTree ===");
DecisionTreeService.processDecisionTree(emailAndSmsTree);

console.log("\n=== Executing optionalMailsTree ===");
DecisionTreeService.processDecisionTree(optionalMailsTree);

const app = express();
app.use(express.json());

app.post("/process-decision-tree", (req, res) => {
  try {
    const { decisionTree, context } = req.body;
    DecisionTreeService.processDecisionTree(decisionTree, context);
    res.json({ status: "success" });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
