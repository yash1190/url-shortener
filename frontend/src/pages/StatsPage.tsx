import { useParams } from "react-router-dom";

const StatsPage = () => {
  const { shortCode } = useParams();
  return <h1>Stats for {shortCode} — coming next</h1>;
};

export default StatsPage;