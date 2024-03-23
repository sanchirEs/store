"use client";
import { db } from "./firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";
//import AddProduct from "./components/AddProduct";
import React, { useEffect, useState } from "react";

async function fetchDataFromFirestore() {
  const querySnapshot = await getDocs(collection(db, "data"));

  const data = [];
  querySnapshot.forEach((doc) => {
    data.push({ id: doc.id, ...doc.data() });
  });
  return data;
}

async function addDataToFireStore(name, barCode, price, count) {
  try {
    const docRef = await addDoc(collection(db, "data"), {
      name: name,
      barCode: barCode,
      price: price,
      count: count,
    });
    console.log("Information written to the database", docRef.id);
    return true;
  } catch (error) {
    console.error("Error adding information to database", error);
    return false;
  }
}

export default function Home() {
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const data = await fetchDataFromFirestore();
      setUserData(data);
    }
    fetchData();
  }, []);

  const [name, setName] = useState("");
  const [barCode, setBarCode] = useState("");
  const [price, setPrice] = useState("");
  const [count, setCount] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const added = await addDataToFireStore(name, barCode, price, count);
    if (added) {
      setName("");
      setBarCode("");
      setPrice("");
      setCount("");

      alert("Data added to firestore DB!! ");
    }
  };

  return (
    <main className="max-w-4xl mx-auto bg-red-400 mt-4">
      <div className="text-center my-5 flex flex-col gap-4">
        <h1 className="text-2xl font-bold">header</h1>
        <form
          onSubmit={handleSubmit}
          className="max-w-md mx-auto p-4 bg-white shadow-md rounded-lg"
        >
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-gray-700 font-bold mb-2"
            >
              Name:
            </label>
            <input
              type="text"
              id="name"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="barCode"
              className="block text-gray-700 font-bold mb-2"
            >
              barCode:
            </label>
            <input
              type="text"
              id="barCode"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              value={barCode}
              onChange={(e) => setBarCode(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="price"
              className="block text-gray-700 font-bold mb-2"
            >
              Price:
            </label>
            <input
              type="text"
              id="price"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="count"
              className="block text-gray-700 font-bold mb-2"
            >
              Count:
            </label>
            <input
              type="text"
              id="count"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />
          </div>
          <div className="text-center">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
            >
              Submit
            </button>
          </div>
        </form>

        <div className="bg-dark">
          {userData.map((user) => (
            <div key={user.id} className="mb-4">
              <p className="text-xl font-bold">{user.name}</p>
              <p>{user.barCode}</p>
              <p>{user.price}</p>
              <p>{user.count}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
