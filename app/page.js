"use client";
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { getDoc } from "firebase/firestore";

const styles = {
  button:
    "inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500",
  input:
    "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500",
  label: "block text-sm font-medium text-gray-700",
  card: "p-6 max-w-sm bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700",
  cardHeader: "text-lg font-semibold text-gray-800 dark:text-white",
  searchInput:
    "flex-grow p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-600",
  tableHeader:
    "text-xs text-left text-gray-700 uppercase bg-purple-200 border-b border-gray-200",
  tableRow:
    "bg-white border-b transition duration-300 ease-in-out hover:bg-purple-100",
  addButton:
    "text-white bg-green-500 hover:bg-green-600 rounded-lg text-sm px-4 py-2",
  // Add more styles as needed
};

// Fetch data from Firestore
async function fetchDataFromFirestore() {
  const querySnapshot = await getDocs(collection(db, "data"));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Add data to Firestore
async function addDataToFireStore(product) {
  try {
    const docRef = await addDoc(collection(db, "data"), product);
    console.log("Information written to the database", docRef.id);
    return true;
  } catch (error) {
    console.error("Error adding information to database", error);
    return false;
  }
}

// Update product count in Firestore
async function updateProductCount(id, newCount) {
  const productRef = doc(db, "data", id);
  try {
    await updateDoc(productRef, { count: newCount });
  } catch (error) {
    throw error; // Propagate the error so that the calling function can catch it
  }
}

export default function Home() {
  const [userData, setUserData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [barCode, setBarCode] = useState("");
  const [price, setPrice] = useState("");
  const [count, setCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState({});
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchDataFromFirestore();
        setUserData(data);
        setFilteredData(data);
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const productToAdd = {
      name,
      barCode,
      price: parseFloat(price),
      count: parseInt(count),
    };
    try {
      const newProductId = await addDataToFireStore(productToAdd);
      if (newProductId) {
        alert("Data added to Firestore DB!!");
        // Directly update the state without re-fetching all data
        const newData = [...userData, { id: newProductId, ...productToAdd }];
        setUserData(newData);
        setFilteredData(newData);
        // Reset form fields
        setName("");
        setBarCode("");
        setPrice("");
        setCount(0);
      }
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  // Function to fetch a single product's updated data from Firestore
  async function fetchProductById(id) {
    const productRef = doc(db, "data", id);
    const productSnap = await getDoc(productRef);
    if (productSnap.exists()) {
      return { id: productSnap.id, ...productSnap.data() };
    } else {
      console.log("No such product!");
    }
  }

  const handleIncrement = async (id, currentCount) => {
    const newCount = currentCount + 1;
    try {
      await updateProductCount(id, newCount);
      setUserData((prevUserData) =>
        prevUserData.map((user) =>
          user.id === id ? { ...user, count: newCount } : user
        )
      );
      try {
        const data = await fetchDataFromFirestore();
        setUserData(data);
        setFilteredData(data);
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
      }
    } catch (error) {
      console.error("Couldn't increment count: ", error);
      // Handle the error, maybe show a notification to the user
    }
  };

  const handleDecrement = async (id, currentCount) => {
    if (currentCount > 0) {
      const newCount = currentCount - 1;
      try {
        await updateProductCount(id, newCount);
        setUserData((prevUserData) =>
          prevUserData.map((user) =>
            user.id === id ? { ...user, count: newCount } : user
          )
        );
        try {
          const data = await fetchDataFromFirestore();
          setUserData(data);
          setFilteredData(data);
        } catch (error) {
          console.error("Error fetching data from Firestore:", error);
        }
      } catch (error) {
        console.error("Couldn't decrement count: ", error);
        // Handle the error, maybe show a notification to the user
      }
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    const lowercasedValue = value.toLowerCase();
    setFilteredData(
      userData.filter(
        (user) =>
          user.name.toLowerCase().includes(lowercasedValue) ||
          user.barCode.includes(value)
      )
    );
  };

  const toggleCheckbox = (id) => {
    setSelectedIds((prevSelectedIds) => ({
      ...prevSelectedIds,
      [id]: !prevSelectedIds[id],
    }));
  };

  const deleteSelectedProducts = async () => {
    try {
      const batch = writeBatch(db);
      Object.keys(selectedIds).forEach((id) => {
        if (selectedIds[id]) {
          batch.delete(doc(db, "data", id));
        }
      });
      await batch.commit();
      // Update local state
      setUserData(userData.filter((user) => !selectedIds[user.id]));
      setSelectedIds({});

      try {
        const data = await fetchDataFromFirestore();
        setUserData(data);
        setFilteredData(data);
      } catch (error) {
        console.error("Error fetching data from Firestore:", error);
      }
    } catch (error) {
      console.error("Error removing products: ", error);
      // Handle errors, such as showing an error notification
    }
  };

  return (
    <main className="h-screen max-w-7xl mx-auto p-8 my-auto bg-gray-100 rounded-lg shadow">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">Product Dashboard</h1>

        <div className="flex flex-col sm:flex-row justify-end items-center w-full sm:w-auto">
          <input
            className="w-full sm:w-auto p-2 border rounded mb-4 sm:mb-0 sm:mr-4"
            placeholder="Search by name or barcode..."
          />

          <button className="w-full sm:w-auto bg-red-500 text-white py-2 px-4 rounded">
            Delete Selected
          </button>
        </div>
      </div>
      <div className="overflow-x-auto relative bg-white rounded-lg shadow-md">
        <table className="w-full text-sm text-gray-500">
          <thead className={styles.tableHeader}>
            <tr>
              <th scope="col" className="py-3 px-2">
                Select
              </th>
              <th scope="col" className="py-3 px-6">
                Product Name
              </th>
              <th scope="col" className="py-3 px-6">
                Barcode
              </th>
              <th scope="col" className="py-3 px-6">
                Price
              </th>
              <th scope="col" className="py-3 px-6">
                Remains
              </th>
              <th scope="col" className="py-3 px-6">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Add product row - Should be placed outside the map function */}
            <tr className={styles.tableRow}>
              <td className="py-4 px-6"> {/* Empty cell for alignment */} </td>
              <td className="py-4 px-6">
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter product name"
                  required
                />
              </td>
              <td className="py-4 px-6">
                <input
                  type="text"
                  id="barCode"
                  value={barCode}
                  onChange={(e) => setBarCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter barcode"
                  required
                />
              </td>
              <td className="py-4 px-6">
                <input
                  type="text"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter price"
                  required
                />
              </td>
              <td className="py-4 px-6">
                <input
                  type="number"
                  id="count"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="0"
                  required
                />
              </td>
              <td className="py-4 px-6">
                <button
                  onClick={handleSubmit}
                  type="button"
                  className="text-white bg-green-500 hover:bg-green-600 rounded-lg text-sm px-4 py-2"
                >
                  Add Product
                </button>
              </td>
            </tr>
            {/* Product rows */}
            {filteredData.map((user) => (
              <tr key={user.id} className={styles.tableRow}>
                <td className="py-4 px-6">
                  <input
                    type="checkbox"
                    checked={!!selectedIds[user.id]} // Use double negation to ensure a boolean
                    onChange={() => toggleCheckbox(user.id)}
                  />
                </td>
                <td className="py-4 px-6">{user.name}</td>
                <td className="py-4 px-6">{user.barCode}</td>
                <td className="py-4 px-6">{user.price}</td>
                <td className="py-4 px-6">{user.count}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => handleDecrement(user.id, user.count)}
                      className="text-white bg-red-500 hover:bg-red-600 rounded-full h-8 w-8 flex items-center justify-center"
                      disabled={user.count <= 0}
                    >
                      -
                    </button>
                    <button
                      onClick={() => handleIncrement(user.id, user.count)}
                      className="text-white bg-blue-500 hover:bg-blue-600 rounded-full h-8 w-8 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
