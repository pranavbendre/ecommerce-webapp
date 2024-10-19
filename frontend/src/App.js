import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {Chart as  ChartJS, BarElement, ArcElement, Tooltip, Legend, CategoryScale, LinearScale} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
ChartJS.register(
   BarElement,
   ArcElement,
   Tooltip,
   Legend,
   CategoryScale,
   LinearScale
);

function App() {
   const [data, setData] = useState([]);
   const [page, setPage] = useState(1);
   const [transactions, setTransactions] = useState([]);
   const [statistics, setStatistics] = useState({});
   const [barData, setBarData] = useState([]);
   const [pieData, setPieData] = useState([]);
   const [month, setMonth] = useState(3); // Default to March
   console.log(month);
   

   useEffect(() => {
      fetchData();
      fetchTransactions();
      fetchStatistics();
      fetchBarChart(); // eslint-disable-next-line
      fetchPieChart(); // eslint-disable-next-line
   }, [month]);


   const fetchData = async () => {
      const response = await axios.get(`http://localhost:5000/api/init`);
      setData(response.data);
        
   };

   const fetchTransactions = async () => {
      const response = await axios.get(`http://localhost:5000/api/transactions?search=&page=${page}&perPage=10`);
      setTransactions(response.data.transactions);
   };

   const fetchStatistics = async () => {
      const response = await axios.get(`http://localhost:5000/api/statistics/${month}`);
      setStatistics(response.data);
   };

   const fetchBarChart = async () => {
      const response = await axios.get(`http://localhost:5000/api/bar-chart/${month}`);
      setBarData(response.data);
   };

   const fetchPieChart = async () => {
      const response = await axios.get(`http://localhost:5000/api/pie-chart/${month}`);
      setPieData(response.data);
   };


   return (
      <div className="App">
         <h1 style={{margin: "33px 0px"}}>Product Transactions</h1>
         <select style={{position: "relative",left: "85vw",padding: "0px 6px",fontSize: "22px",margin: "14px"}} onChange={(e) => setMonth(e.target.value)} value={month}>
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
         </select>

         {/* Transactions Table */}
         <table className='table table-primary table-bordered border-primary'>
            <thead>
               <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Category</th>
               </tr>
            </thead>
            <tbody>
               {transactions.map(transaction => (
                  <tr key={transaction.id}>
                     <td>{transaction.title}</td>
                     <td>{transaction.description}</td>
                     <td>{transaction.price}</td>
                     <td>{transaction.category}</td>
                  </tr>
               ))}
            </tbody>
         </table>

          <button disabled={page<=1} type="button" className='btn' onClick={()=>setPage({page: page-1})}>&larr; Previous </button>

         <button disabled={page>60} type="button" className='btn' onClick={()=>setPage({page:page+1})}>&rarr; Next </button>

         {/* Statistics */}
         <div className="statistics">
            <h2 style={{margin: "40px 0px"}}>Statistics for Month {month}</h2>
            <p>Total Sales Amount : ${statistics.totalSalesAmount}</p>
            <p>Total Sold Items : {statistics.totalItemsSold}</p>
            <p>Total Not Sold Items : {statistics.totalNotSoldItems}</p>
         </div>

         {/* Bar Chart */}
         <Bar data={{
               labels:['0-100','101-200','201-300','301-400','401-500','501-600','601-700','701-800','801-900','901-above'],
               datasets:[{
                  label:'Number of Items',
                  data:[...barData.map(item=>item.count)],
                  backgroundColor:'rgba(75,192,192,0.4)',
                  borderColor:'rgba(75,192,192,1)',
                  borderWidth:'1'
               }]
         }} />

         {/* Pie Chart */}
         <Pie data={{labels: ["men's clothing", "jewelery", "	electronics", "women's clothing"],
               datasets: [
            {
            data: [...pieData.map(item=>item.count)],
            backgroundColor: [
               'rgba(255, 99, 132, 0.2)',
               'rgba(54, 162, 235, 0.2)',
               'rgba(24, 160, 135, 0.2)',
               'rgb(145, 0, 255, 0.2)'
            ],
            borderWidth: 1,
            },
    ],}} />

      </div>
   );
}

export default App;
