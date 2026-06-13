import { Code2, MessageSquareText, Users, Brain, Star } from "lucide-react";

export const SKILL_ICONS = {
  technical: Code2,
  communication: MessageSquareText,
  teamFit: Users,
  problemSolving: Brain,
  leadership: Star,
};


export const metrics = [
  {
    id: 1,
    title: "Technical Skills",
    icon: "technical",
    score: 4,
    leftLabel: "Junior",
    rightLabel: "Senior",
  },
  {
    id: 2,
    title: "Communication",
    icon: "communication",
    score: 3.5,
    leftLabel: "Quiet",
    rightLabel: "Articulate",
  },
  {
    id: 3,
    title: "Team Fit",
    icon: "teamFit",
    score: 4.5,
    leftLabel: "Individual",
    rightLabel: "Collaborator",
  },
  {
    id: 4,
    title: "Problem Solving",
    icon: "problemSolving",
    score: 4,
    leftLabel: "Methodical",
    rightLabel: "Innovative",
  },
  {
    id: 5,
    title: "Leadership",
    icon: "leadership",
    score: 3,
    leftLabel: "Supporter",
    rightLabel: "Director",
  },
];

export const candidate = {
  name: "Alex Rivera",
  role: "Software Engineer Intern",
  batch: "Summer 2024",
};
