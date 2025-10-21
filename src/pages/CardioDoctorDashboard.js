import React from "react";
import "../styles/CardioDoctorDashboard.css";
import { Cell, Pie, PieChart,Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const overviewCards = [
  { label: "Total Patients", value: 525 },
  { label: "Today's Appointments", value: 25 },
  { label: "Doctors On Duty", value: "Active" },
  { label: "Revenue Summary", value: "Rs.10,000" },
];

const renderColorfulLegendText = (value, entry) => {
  return (
    <span style={{ color: "#596579", fontWeight: 500, padding: "10px" }}>
      {value}
    </span>
  );
};

const data = [
  { name: "Excellent", value: 400, fill: "#3671E7" },
  { name: "Good", value: 300, fill: "#0165Fc" },
  { name: "Poor", value: 300, fill: "#FE8D28" },
];

const COLORS = ['#3671E7', '#0165Fc', '#FE8D28'];

const dataline = [
  {
    date: '2000-01',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    date: '2000-02',
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    date: '2000-03',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    date: '2000-04',
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    date: '2000-05',
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    date: '2000-06',
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    date: '2000-07',
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
  {
    date: '2000-08',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    date: '2000-09',
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    date: '2000-10',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    date: '2000-11',
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    date: '2000-12',
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
];

const monthTickFormatter = (tick) => {
  const date = new Date(tick);

  return date.getMonth() + 1;
};

const renderQuarterTick = (tickProps) => {
  const { x, y, payload, width, visibleTicksCount } = tickProps;
  const { value, offset } = payload;
  const date = new Date(value);
  const month = date.getMonth();
  const quarterNo = Math.floor(month / 3) + 1;
  const isMidMonth = month % 3 === 1;

  if (month % 3 === 1) {
    return <text x={x + width / visibleTicksCount / 2 - offset} y={y - 4} textAnchor="middle">{`Q${quarterNo}`}</text>;
  }

  const isLast = month === 11;

  if (month % 3 === 0 || isLast) {
    const pathX = Math.floor(isLast ? x - offset + width / visibleTicksCount : x - offset) + 0.5;

    return <path d={`M${pathX},${y - 4}v${-35}`} stroke="red" />;
  }
  return null;
};

export default function CardioDoctorDashboard()  {
  return (
     <div className="dashboard-main">
      <header className="app-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <div className="header-search">
          <input type="text" placeholder="Search" />
          <button className="search-btn">&#128269;</button>
        </div>
        <div className="header-right">
          <button className="icon-btn bell-icon">&#128276;</button>
          <div className="user-profile">
            <span className="user-name">User Name</span>
            <span className="role">Admin</span>
          </div>
          <div className="avatar">A</div>
        </div>
      </header>

      <div className="overview-cards">
        {overviewCards.map((card, idx) => (
          <div className="overview-card" key={idx}>
            <span>{card.label}</span>
            <span className="card-value">{card.value}</span>
          </div>
        ))}
      </div>

      <div className="dashboard-content">
        <div className="charts-section">
          <h2>Graphs/Charts</h2>
            <ResponsiveContainer width="100%" height="100%">
      <BarChart
        width={500}
        height={300}
        data={dataline}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tickFormatter={monthTickFormatter} />
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          interval={0}
          tick={renderQuarterTick}
          height={1}
          scale="band"
          xAxisId="quarter"
        />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="pv" fill="#8884d8" />
        <Bar dataKey="uv" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
        </div>

        <div className="doctor-performance">
          <h2>Doctor Performance</h2>
            <PieChart width={800} height={400}>
      <Legend
          height={36}
          iconType="circle"
          layout="vertical"
          verticalAlign="middle"
          iconSize={10}
          padding={5}
          formatter={renderColorfulLegendText}
        />
      <Pie
        data={data}
        cx={120}
        cy={200}
        innerRadius={60}
        outerRadius={80}
        fill="#8884d8"
        paddingAngle={5}
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
    </PieChart>
        </div>

        </div>
      </div>
  );
};
