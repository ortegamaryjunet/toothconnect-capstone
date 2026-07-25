import { useEffect, useState } from 'react';

let chartToolsPromise;

function loadChartTools() {
  if (!chartToolsPromise) {
    chartToolsPromise = Promise.all([
      import('chart.js'),
      import('react-chartjs-2'),
    ]).then(([chartJs, reactCharts]) => {
      chartJs.Chart.register(
        chartJs.CategoryScale,
        chartJs.LinearScale,
        chartJs.BarElement,
        chartJs.ArcElement,
        chartJs.Tooltip,
        chartJs.Legend
      );

      return {
        Bar: reactCharts.Bar,
        Doughnut: reactCharts.Doughnut,
      };
    });
  }

  return chartToolsPromise;
}

export default function LazyChart({ type = 'bar', data, options }) {
  const [charts, setCharts] = useState(null);

  useEffect(() => {
    let isMounted = true;

    loadChartTools().then((loadedCharts) => {
      if (isMounted) {
        setCharts(loadedCharts);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!charts) {
    return null;
  }

  const ChartComponent = type === 'doughnut' ? charts.Doughnut : charts.Bar;

  return <ChartComponent data={data} options={options} />;
}
