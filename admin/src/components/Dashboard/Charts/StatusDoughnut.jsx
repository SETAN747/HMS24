import { Doughnut } from "react-chartjs-2";
 

 

const StatusDoughnut = ({ counts }) => {
  const data = {
  labels: [
    "Pending",
    "Confirmed (Paid)",
    "Checked In",
    "In Consultation",
    "Completed",
    "No Show",
    "Cancelled by User",
    "Cancelled by Doctor",
    "Refunded",
  ],
  datasets: [
    {
      label: "Appointments",
      data: [
        counts.pending || 1,
        counts.confirmed || 2, // confirmed = paid
        counts.checked_in || 3,
        counts.in_consultation || 4,
        counts.completed || 5,
        counts.no_show || 6,
        counts.cancelled_by_user || 7,
        counts.cancelled_by_doctor || 8,
        counts.refunded || 9,
      ],
      backgroundColor: [
        "#EEF2FF", // indigo-50
  "#E0E7FF", // indigo-100
  "#C7D2FE", // indigo-200
  "#A5B4FC", // indigo-300
  "#818CF8", // indigo-400
  "#6366F1", // indigo-500
  "#4F46E5", // indigo-600
  "#4338CA", // indigo-700
  "#3730A3", // indigo-800
      ],
      borderWidth: 2,
      borderColor: "#fff",
      hoverOffset: 8,
    },
  ],
};

  const options = {
    plugins: {
      legend: {
        position: "bottom",
      },
    },
    cutout: "70%", // donut thickness
    responsive: true,
  };

  return (
    <div className="flex justify-center items-center w-full h-[300px]">
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default StatusDoughnut;
