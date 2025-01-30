import { useEffect, useState } from "react";

export default function App() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  const addOrUpdateProduct = async () => {
    if (editingId) {
      await fetch(`http://localhost:5000/products/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price: parseFloat(price) }),
      });
      setProducts(products.map(p => p.id === editingId ? { id: editingId, name, price: parseFloat(price) } : p));
      setEditingId(null);
    } else {
      const response = await fetch("http://localhost:5000/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price: parseFloat(price) }),
      });
      const newProduct = await response.json();
      setProducts([...products, { id: newProduct.id, name, price: parseFloat(price) }]);
    }
    setName("");
    setPrice("");
  };

  const deleteProduct = async (id) => {
    await fetch(`http://localhost:5000/products/${id}`, {
      method: "DELETE"
    });
    setProducts(products.filter(p => p.id !== id));
  };

  const startEditing = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setPrice(product.price);
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-lg rounded-lg w-full">
      <h1 className="text-2xl font-bold mb-4 text-center text-gray-700">Product Manager</h1>
      <div className="mb-6 p-4 border rounded-lg bg-gray-50 w-full">
        <h2 className="text-lg font-semibold mb-2 text-gray-600">{editingId ? "Edit Product" : "Add New Product"}</h2>
        <div className="flex gap-2 mb-3 w-full">
          <input
            className="border p-2 flex-1 rounded-md focus:ring focus:ring-blue-200 w-full"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="border p-2 flex-1 rounded-md focus:ring focus:ring-blue-200 w-full"
            placeholder="Price (€)"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <button 
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold p-2 rounded-md"
          onClick={addOrUpdateProduct}>
          {editingId ? "Update Product" : "Add Product"}
        </button>
      </div>
      <h2 className="text-lg font-semibold mt-6 mb-3 text-gray-600">Product List</h2>
      <ul className="divide-y divide-gray-300 w-full">
        {products.length > 0 ? (
          products.map((p) => (
            <li key={p.id} className="p-3 flex justify-between items-center bg-gray-100 rounded-lg shadow mb-2 w-full">
              <span className="text-gray-700 font-medium">{p.name} - €{p.price.toFixed(2)}</span>
              <div className="flex gap-2">
                <button onClick={() => startEditing(p)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md">Edit</button>
                <button onClick={() => deleteProduct(p.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md">Delete</button>
              </div>
            </li>
          ))
        ) : (
          <p className="text-center text-gray-500">No products available. Add some!</p>
        )}
      </ul>
    </div>
  );
}
