'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { X } from 'lucide-react'

export default function Component() {
  const [requests, setRequests] = useState([
    {
      id: 1,
      product: 'Product A',
      quantity: 100,
      status: 'New',
      dateCreated: '2022-01-01'
    },
    {
      id: 2,
      product: 'Product B',
      quantity: 200,
      status: 'In Progress',
      dateCreated: '2022-01-05'
    },
    {
      id: 3,
      product: 'Product C',
      quantity: 300,
      status: 'Completed',
      dateCreated: '2022-01-10'
    }
  ])

  const [selectedRequest, setSelectedRequest] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleEdit = (id) => {
    // Implement edit functionality
    console.log('Edit request:', id)
  }

  const handleDelete = (id) => {
    setRequests(requests.filter(request => request.id !== id))
  }

  const handleMarkComplete = (id) => {
    setRequests(requests.map(request => 
      request.id === id ? { ...request, status: 'Completed' } : request
    ))
  }

  const handleView = (request) => {
    setSelectedRequest(request)
    setIsDialogOpen(true)
  }

  const handleAddNew = () => {
    // Implement add new functionality
    console.log('Add new request')
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Processing Request List</h1>
        <Button onClick={handleAddNew} className="bg-green-500 hover:bg-green-600 text-white">
          Add New Processing Request
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Request ID</TableHead>
              <TableHead>Product to Process</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.id}</TableCell>
                <TableCell>{request.product}</TableCell>
                <TableCell>{request.quantity}</TableCell>
                <TableCell>{request.status}</TableCell>
                <TableCell>{request.dateCreated}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => handleEdit(request.id)}
                      variant="outline"
                      size="sm"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(request.id)}
                      variant="destructive"
                      size="sm"
                    >
                      Delete
                    </Button>
                    <Button
                      onClick={() => handleMarkComplete(request.id)}
                      variant="outline"
                      size="sm"
                      disabled={request.status === 'Completed'}
                    >
                      Mark Complete
                    </Button>
                    <Button
                      onClick={() => handleView(request)}
                      variant="outline"
                      size="sm"
                    >
                      View
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="relative">
            <DialogTitle>Processing Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-bold">Request ID:</span>
                <span className="col-span-3">{selectedRequest.id}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-bold">Product Processed:</span>
                <span className="col-span-3">{selectedRequest.product}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-bold">Quantity To Process:</span>
                <span className="col-span-3">{selectedRequest.quantity}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-bold">Status:</span>
                <span className="col-span-3">{selectedRequest.status}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-bold">New Product Produced:</span>
                <span className="col-span-3">{selectedRequest.status}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-bold">Quantity Produced:</span>
                <span className="col-span-3">{selectedRequest.status}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-bold">Request Issue date:</span>
                <span className="col-span-3">{selectedRequest.status}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-bold">Request Completion Date:</span>
                <span className="col-span-3">{selectedRequest.status}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}