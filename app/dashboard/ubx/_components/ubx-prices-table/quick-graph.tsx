'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  TooltipItem
} from 'chart.js';
import { UBXPrice } from '../ubx-prices-history-table';
import moment from 'moment';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useTranslations } from 'next-intl';

// Register required chart elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const QuickGraph = ({ data, symbol }: { data: UBXPrice[]; symbol: string }) => {
  const t = useTranslations('ubxPriceTable');

  // Define the type for grouped data
  interface GroupedData {
    [key: string]: UBXPrice[]; // String keys (dates) and values as arrays of UBXPrice
  }

  // Group data by date (YYYY-MM-DD)
  const groupedData: GroupedData = data.reduce((acc, curr) => {
    const day = moment(curr.date).format('YYYY-MM-DD'); // Get the full date (YYYY-MM-DD)
    if (!acc[day]) acc[day] = [];
    acc[day].push(curr);
    return acc;
  }, {} as GroupedData); // Type assertion here

  // Prepare the labels (dates)
  const labels = Object.keys(groupedData); // Get the unique dates
  const openData = labels.map((date) => groupedData[date][0].open); // Take the first 'open' value of each day
  const closeData = labels.map((date) => groupedData[date][0].close); // Take the first 'close' value of each day
  const highData = labels.map((date) =>
    Math.max(...groupedData[date].map((item) => item.high))
  ); // Max 'high' value of each day
  const lowData = labels.map((date) =>
    Math.min(...groupedData[date].map((item) => item.low))
  ); // Min 'low' value of each day

  // Chart.js data structure
  const chartData = {
    labels, // Use the formatted date as labels
    datasets: [
      {
        label: t('open'),
        data: openData,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: false,
        hidden: true // Hide this dataset by default
      },
      {
        label: `${t('close')}`,
        data: closeData,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: false
      },
      {
        label: t('high'),
        data: highData,
        borderColor: 'rgba(255, 159, 64, 1)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        fill: false,
        hidden: true // Hide this dataset by default
      },
      {
        label: t('low'),
        data: lowData,
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        fill: false,
        hidden: true // Hide this dataset by default
      }
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `${symbol} ${t('history')} (₮)`
      },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<'line'>) {
            return context.dataset.label + ': ' + context.raw;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: `${t('date')} (YYYY-MM-DD)`
        },
        ticks: {
          // Rotate the labels for better readability
          maxRotation: 90,
          minRotation: 45
        }
      }
    }
  };

  return (
    <div>
      <ScrollArea className="grid h-full rounded-md border md:h-full">
        <Line data={chartData} options={chartOptions} />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default QuickGraph;
