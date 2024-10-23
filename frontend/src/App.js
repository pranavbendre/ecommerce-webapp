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
   let [page, setPage] = useState(1);
   const [transactions, setTransactions] = useState([]);
   const [searchedData, setSearchedData] = useState([]);
   console.log(searchedData);
   
   const [stringLength, setStringLength] = useState(0);
   const [statistics, setStatistics] = useState({});
   const [barData, setBarData] = useState([]);
   const [pieData, setPieData] = useState([]);
   const [month, setMonth] = useState(1);
   

   useEffect(() => {
      fetchData();
      fetchTransactions();
      fetchStatistics();
      fetchBarChart(); // eslint-disable-next-line
      fetchPieChart(); // eslint-disable-next-line
   }, [month]);


   const fetchData = async () => {
      await axios.get(`http://localhost:5000/api/init`);
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

   const searchData = (element) => {
         setStringLength(element.length)
         setSearchedData(transactions.filter((transaction)=>
            transaction.title.toLowerCase().includes(element) ||
            parseInt(transaction.price) === parseInt(element)) /*.includes() used to comapre two strings and .filter() is used to common out matched values in an array */
         );         
   }


   return (
      <div className="App">
         <h1 style={{margin: "46px 0px 38px 0px", fontSize: "28px", display: "flex", justifyContent: "center", textDecoration: "underline", color: "gray", fontWeight: "bold"}}>Product Transactions</h1>

      <div className="container-fluid" style={{position: "absolute", padding: "0px 465px", right: "330px"}}>
      <form className="d-flex" role="search">
         <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" onChange={(e) => searchData(e.target.value.toLowerCase())} />
      </form>
      </div>

         <select style={{position: "relative",left: "80vw",padding: "3px 2px",fontSize: "19px",margin: "14px", bottom:"13px", background: "black", color: "white"}} onChange={(e) => setMonth(e.target.value)} value={month}>
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
         <table className='table table-light table-bordered border-primary table-striped' style={{width: "84vw", position: "relative", left: "128px"}}>
            <thead>
               <tr>
                  <th scope="col">Title</th>
                  <th scope="col">Description</th>
                  <th scope="col">Price</th>
                  <th scope="col">Category</th>
               </tr>
            </thead>
            <tbody>
               {searchedData.length > 0 && stringLength > 0 ? searchedData.map(data => (
                    <tr key={data.id}>
                    <td>{data.title}</td>
                    <td>{data.description}</td>
                    <td>{data.price}</td>
                    <td>{data.category}</td>
                 </tr>
                )):transactions.map(transaction => (
                  <tr key={transaction.id}>
                     <td>{transaction.title}</td>
                     <td>{transaction.description}</td>
                     <td>{transaction.price}</td>
                     <td>{transaction.category}</td>
                  </tr>
               ))}

            </tbody>
         </table>

          <button disabled={page<=1} type="button" className='btn' style={{color: "black", backgroundColor: "white", fontSize: "13px", position: "absolute", right: "210px"}} onClick={()=>{setPage(page-=1);fetchTransactions()}}>&larr; Previous </button>

          <p style={{color: "white", position: "absolute", left: "1077px", marginTop: "4px"}}>{page}</p>

         <button disabled={page>=6} type="button" className='btn' style={{color: "black", backgroundColor: "white", fontSize: "13px", position: "absolute", right: "70px", padding: "6px 22px"}} onClick={()=>{setPage(page+=1);fetchTransactions()}}>&rarr; Next </button>
         
         

         {/* Statistics */}
         <div className="statistics">
            <h2 style={{margin: "133px 0px 55px 0px", fontSize: "28px", display: "flex", justifyContent: "center", textDecoration: "underline", color: "gray", fontWeight: "bold"}}>Statistics for Month {month}</h2>

            <div className="statistics-child" style={{color:"white", position:"relative", margin: "43px 65px"}}>
            <p>Total Sales Amount : ${statistics.totalSalesAmount}</p>
            <p>Total Sold Items : {statistics.totalItemsSold}</p>
            <p>Total Not Sold Items : {statistics.totalNotSoldItems}</p>
            </div>
        

         </div>

         {/* Bar Chart */}
         <Bar style={{background:"#505050bf", position: "relative", left: "65px", display: "flex", maxWidth: "91%"}} data={{
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
         <Pie style={{position: "relative", padding: "204px", bottom: "94px"}} data={{labels: ["men's clothing", "jewelery", "	electronics", "women's clothing"],
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
