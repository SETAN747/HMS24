
import { Bar } from "react-chartjs-2";
import { ChartJS } from "../../../Config/ChartsConfig"

const WeeklyBarChart = ({ labels = [], values = [] }) => {
  const data = {
    labels,
    datasets: [{ label: "Appointments", data: values, borderRadius: 8,backgroundColor: "#4F46E5", }]
  };
  return <Bar data={data} options={{ responsive: true, plugins: { legend: { display: false } } }} />;
};

export default WeeklyBarChart;
