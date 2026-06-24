import EvaluationPage from "@/components/admin/Evaluation/EvaluationPage";
import InterviewNotes from "@/components/admin/Evaluation/InterviewNotes"

export default function Page() {
  return (
    <div className="w-full">
      <EvaluationPage />
      <InterviewNotes />
    </div>
  );
}