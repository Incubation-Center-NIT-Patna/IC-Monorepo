'use client';
import React from "react"; 
import ActionButtons from "@/components/admin/Evaluation/feedback/ActionButtons"
import NotesInput from "@/components/admin/Evaluation/feedback/NotesInput"
import AggregateScore from "@/components/admin/Evaluation/feedback/AggregateScore"


const InterviewNotes = () => {


  return (
    <div>
      <NotesInput /> 
      <AggregateScore />
      <ActionButtons />   
    </div>
  )
}

export default InterviewNotes

