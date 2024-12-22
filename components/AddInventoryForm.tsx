"use client";
import { useState } from "react";
import axios from "axios";

export default function AddInventoryForm() {
    const [name, setName] = useState("");
    const [quantity, setQuantity] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await axios.post("/api/items", { name, quantity });
        alert("Item added!");
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Name:</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Quantity:</label>
                <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    required
                />
            </div>
            <button type="submit">Add Item</button>
        </form>
    );
}
