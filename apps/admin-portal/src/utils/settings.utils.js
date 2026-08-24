export const createEmptyRound = () => ({
  id: crypto.randomUUID(),
  title: "",
  duration: null,
  interviewer: "",
  active: true,
});