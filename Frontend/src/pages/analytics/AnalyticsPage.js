import React, { useState } from 'react';
import { useQuery } from 'react-query';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import { useMood } from '../../contexts/MoodContext';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend,
  ArcElement
);

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-6);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
`;

const Title = styled.h1`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  font-family: var(--font-family-heading);
`;

const PeriodSelector = styled.div`
  display: flex;
  gap: var(--spacing-2);
`;

const PeriodButton = styled.button`
  padding: var(--spacing-2) var(--spacing-4);
  border: 1px solid var(--color-border);
  background: ${props => props.active ? 'var(--color-primary)' : 'var(--color-background)'};
  color: ${props => props.active ? 'white' : 'var(--color-text)'};
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background: ${props => props.active ? 'var(--color-primary-dark)' : 'var(--color-surface-variant)'};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-8);
`;

const StatCard = styled(motion.div)`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  text-align: center;
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  background: var(--gradient-primary);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto var(--spacing-4);
  color: white;
`;

const StatValue = styled.div`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin-bottom: var(--spacing-2);
`;

const StatLabel = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-8);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled(motion.div)`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
`;

const ChartTitleStyled = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--spacing-4);
  font-family: var(--font-family-heading);
`;

const ChartContainer = styled.div`
  position: relative;
  height: 300px;
`;

const InsightsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-6);
`;

const InsightCard = styled(motion.div)`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
`;

const InsightIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${props => props.color || 'var(--gradient-primary)'};
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-bottom: var(--spacing-3);
  color: white;
`;

const InsightTitle = styled.h4`
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--spacing-2);
`;

const InsightDescription = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-8);
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-border);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const AnalyticsPage = () => {
  const { getMoodColor } = useMood();
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery(
    ['analytics', selectedPeriod],
    async () => {
      const response = await axios.get(`/api/analytics/dashboard?period=${selectedPeriod}`);
      return response.data.data;
    },
    {
      refetchOnWindowFocus: true,
      staleTime: 0,
      cacheTime: 0,
    }
  );

  // Fetch mood insights
  const { data: moodInsights } = useQuery(
    ['mood-insights', selectedPeriod],
    async () => {
      const response = await axios.get(`/api/analytics/mood-insights?period=${selectedPeriod}`);
      return response.data.data;
    },
    {
      refetchOnWindowFocus: true,
      staleTime: 0,
      cacheTime: 0,
    }
  );

  const periods = [
    { value: '7', label: '7 Days' },
    { value: '30', label: '30 Days' },
    { value: '90', label: '90 Days' },
    { value: '365', label: '1 Year' }
  ];

  // Ordered mood scale for Y-axis display (low to high energy/valence)
  const moodOrder = ['angry', 'sad', 'lonely', 'anxious', 'confused', 'neutral', 'calm', 'grateful', 'happy', 'excited'];
  const moodIndex = Object.fromEntries(moodOrder.map((m, i) => [m, i]));

  // Prepare mood trend chart data (dominant mood per date)
  const moodTrendData = analyticsData?.mood?.trend ? (() => {
    const rawTrend = analyticsData.mood.trend;
    // Group by date and pick dominant mood (by count, tie-break by avgIntensity)
    const byDate = {};
    rawTrend.forEach(item => {
      const date = item._id?.date || item.date; // 'YYYY-MM-DD'
      const mood = item._id?.mood || item.mood;
      const count = item.count || 1;
      const intensity = item.avgIntensity || 0;
      if (!byDate[date] || (count > byDate[date].count) || (count === byDate[date].count && intensity > byDate[date].intensity)) {
        byDate[date] = { mood, count, intensity };
      }
    });

    const sortedDates = Object.keys(byDate).sort((a, b) => new Date(a) - new Date(b));
    return {
      labels: sortedDates.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [
        {
          label: 'Mood Trend',
          // Plot index of the mood; Y-axis ticks will show mood names
          data: sortedDates.map(d => {
            const m = byDate[d].mood;
            return m in moodIndex ? moodIndex[m] : moodIndex['neutral'];
          }),
          borderColor: 'var(--color-primary)',
          borderWidth: 3,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: 'var(--color-primary)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          backgroundColor: 'rgba(74, 144, 226, 0.25)',
          spanGaps: true,
          tension: 0.4,
          fill: true
        }
      ]
    };
  })() : null;

  // moodTrendOptions will be defined after base chartOptions

  // Prepare mood distribution chart data
  const moodDistributionData = analyticsData?.mood?.distribution ? {
    labels: analyticsData.mood.distribution.map(item => 
      item._id.charAt(0).toUpperCase() + item._id.slice(1)
    ),
    datasets: [
      {
        data: analyticsData.mood.distribution.map(item => item.count),
        backgroundColor: analyticsData.mood.distribution.map(item => 
          getMoodColor(item._id) + '80'
        ),
        borderColor: analyticsData.mood.distribution.map(item => 
          getMoodColor(item._id)
        ),
        borderWidth: 2
      }
    ]
  } : null;

  // Prepare writing patterns chart data
  const writingPatternsData = analyticsData?.patterns?.writing ? {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Entries per Day',
        data: [2, 3, 1, 4, 2, 1, 0], // Mock data - replace with real data
        backgroundColor: 'rgba(74, 144, 226, 0.8)',
        borderColor: 'var(--color-primary)',
        borderWidth: 1
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'var(--color-text)',
          font: {
            family: 'var(--font-family-primary)'
          }
        }
      },
      tooltip: {
        backgroundColor: 'var(--color-surface)',
        titleColor: 'var(--color-text)',
        bodyColor: 'var(--color-text-secondary)',
        borderColor: 'var(--color-border)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          color: 'var(--color-border)'
        },
        ticks: {
          color: 'var(--color-text-secondary)',
          font: {
            family: 'var(--font-family-primary)'
          }
        }
      },
      y: {
        grid: {
          color: 'var(--color-border)'
        },
        ticks: {
          color: 'var(--color-text-secondary)',
          font: {
            family: 'var(--font-family-primary)'
          }
        }
      }
    }
  };

  // Derived options for Mood Trend to show mood names on Y-axis
  const moodTrendOptions = moodTrendData ? {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        min: 0,
        max: moodOrder.length - 1,
        ticks: {
          ...chartOptions.scales.y.ticks,
          stepSize: 1,
          callback: (value) => {
            const name = moodOrder[value] || '';
            return name ? name.charAt(0).toUpperCase() + name.slice(1) : '';
          }
        }
      }
    }
  } : chartOptions;

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'var(--color-text)',
          font: {
            family: 'var(--font-family-primary)'
          }
        }
      },
      tooltip: {
        backgroundColor: 'var(--color-surface)',
        titleColor: 'var(--color-text)',
        bodyColor: 'var(--color-text-secondary)',
        borderColor: 'var(--color-border)',
        borderWidth: 1
      }
    }
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingSpinner>
          <Spinner />
        </LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Analytics Dashboard</Title>
        <PeriodSelector>
          {periods.map(period => (
            <PeriodButton
              key={period.value}
              active={selectedPeriod === period.value}
              onClick={() => setSelectedPeriod(period.value)}
            >
              {period.label}
            </PeriodButton>
          ))}
        </PeriodSelector>
      </Header>

      <StatsGrid>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <StatIcon>📝</StatIcon>
          <StatValue>{analyticsData?.journal?.totalEntries || 0}</StatValue>
          <StatLabel>Total Entries</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StatIcon>📊</StatIcon>
          <StatValue>{analyticsData?.journal?.avgWordsPerEntry || 0}</StatValue>
          <StatLabel>Avg Words/Entry</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <StatIcon>⏱️</StatIcon>
          <StatValue>{analyticsData?.journal?.totalReadingTime || 0}</StatValue>
          <StatLabel>Total Reading Time (min)</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <StatIcon>🔥</StatIcon>
          <StatValue>{analyticsData?.streaks?.current || 0}</StatValue>
          <StatLabel>Current Streak</StatLabel>
        </StatCard>
      </StatsGrid>

      <ChartsGrid>
        <ChartCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <ChartTitleStyled>Mood Trend</ChartTitleStyled>
          <ChartContainer>
            {moodTrendData && (
              <Line data={moodTrendData} options={moodTrendOptions} />
            )}
          </ChartContainer>
        </ChartCard>

        <ChartCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <ChartTitleStyled>Mood Distribution</ChartTitleStyled>
          <ChartContainer>
            {moodDistributionData && (
              <Doughnut data={moodDistributionData} options={doughnutOptions} />
            )}
          </ChartContainer>
        </ChartCard>
      </ChartsGrid>

      <ChartCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <ChartTitleStyled>Writing Patterns</ChartTitleStyled>
        <ChartContainer>
          {writingPatternsData && (
            <Bar data={writingPatternsData} options={chartOptions} />
          )}
        </ChartContainer>
      </ChartCard>

      <InsightsGrid>
        {moodInsights?.insights?.map((insight, index) => (
          <InsightCard
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
          >
            <InsightIcon color={getMoodColor(insight.type)}>
              {insight.type === 'time' ? '⏰' : 
               insight.type === 'trend' ? '📈' : '💡'}
            </InsightIcon>
            <InsightTitle>{insight.title}</InsightTitle>
            <InsightDescription>{insight.description}</InsightDescription>
          </InsightCard>
        ))}

        <InsightCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <InsightIcon>🎯</InsightIcon>
          <InsightTitle>Recommendations</InsightTitle>
          <InsightDescription>
            {moodInsights?.recommendations?.join(' • ') || 
             'Keep journaling regularly to see more insights and patterns in your mood and writing habits.'}
          </InsightDescription>
        </InsightCard>
      </InsightsGrid>
    </Container>
  );
};

export default AnalyticsPage;
