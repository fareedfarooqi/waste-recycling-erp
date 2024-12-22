"use client";
import { useEffect, useState } from "react";
import axios from "axios";

type Item = { id: number; name: string; quantity: number };

export default function InventoryList() {
    const [items, setItems] = useState<Item[]>([]);

    useEffect(() => {
        axios.get("/api/items")
            .then((response) => setItems(response.data))
            .catch((error) => console.error("Error fetching data:", error));
    }, []);

    return (
        <ul>
            {items.map((item) => (
                <li key={item.id}>
                    {item.name} - Quantity: {item.quantity}
                </li>
            ))}
        </ul>
    );
}
