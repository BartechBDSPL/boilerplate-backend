# API Documentation

## Transaction Routes

### POST /get-active-production-orders-by-assigned-line

Retrieves active production orders for a specific assigned line.

#### Request Body
```json
{
  "assigned_line": "string"  // Required: The assigned line to filter production orders
}
```

#### Response

##### Success Response (200 OK)
```json
{
  "Status": "T",
  "Message": "Active production orders fetched successfully",
  "data": [
    {
      "order_number": "string"
    }
  ]
}
```

##### Error Responses

- **400 Bad Request** (Missing required field)
```json
{
  "Status": "F",
  "Message": "assigned_line is required",
  "data": null
}
```

- **500 Internal Server Error** (Database or server error)
```json
{
  "Status": "F",
  "Message": "Error message",
  "data": null
}
```

### POST /get-unprinted-labels

Retrieves unprinted labels for a specific production order.

#### Request Body
```json
{
  "order_number": "string"  // Required: The production order number to fetch unprinted labels for
}
```

#### Response

##### Success Response (200 OK)
```json
{
  "Status": "T",
  "Message": "Unprinted labels fetched successfully",
  "data": [
    {
      "id": "number",
      "order_number": "string",
      "material_number": "string",
      "material_description": "string",
      "batch_number": "string",
      "serial_no": "string",
      "quantity": "number",
      "print_by": "string",
      "print_date": "string",
      "inserted_by": "string",
      "inserted_date": "string",
      "basic_start_date": "string",
      "basic_end_date": "string"
    }
  ]
}
```

##### Error Responses

- **400 Bad Request** (Missing required field)
```json
{
  "Status": "F",
  "Message": "order_number is required",
  "data": null
}
```

- **500 Internal Server Error** (Database or server error)
```json
{
  "Status": "F",
  "Message": "Error message",
  "data": null
}
```

### POST /update-label-printing-print-status

Updates the print status for a label by serial number. If `isLast` is true, also updates the production order end date.

#### Request Body
```json
{
  "serial_no": "string",  // Required: The serial number of the label to update
  "print_by": "string",   // Required: The user who printed the label
  "isLast": "boolean",    // Optional: If true, also updates the production order end date
  "order_number": "string" // Required if isLast is true: The production order number
}
```

#### Response

##### Success Response (200 OK)
```json
{
  "Status": "T",
  "Message": "Printed successfully."
}
```

##### Error Responses

- **400 Bad Request** (Missing required fields)
```json
{
  "Status": "F",
  "Message": "serial_no and print_by are required",
  "data": null
}
```

- **Serial not found**
```json
{
  "Status": "F",
  "Message": "Serial no not found."
}
```

- **Already printed**
```json
{
  "Status": "F",
  "Message": "Label already printed."
}
```

- **500 Internal Server Error** (Database or server error)
```json
{
  "Status": "F",
  "Message": "Error message",
  "data": null
}
```
