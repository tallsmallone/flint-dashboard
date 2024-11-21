import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { HouseholdItem } from "@/types/HouseholdItem";
import { ObjectId, Filter } from "mongodb";

type HouseholdItemWithId = Omit<HouseholdItem, "_id"> & {
  _id: string | ObjectId;
};

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("flint");
    const collection = db.collection<HouseholdItem>("household_items");

    // Create an index on commonly searched fields
    await collection.createIndex({ name: 1 });
    await collection.createIndex({ category: 1 });

    const items = await collection.find({} as Filter<HouseholdItem>).toArray();
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch household items with error " + String(error) },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("flint");
    const collection = db.collection<HouseholdItem>("household_items");

    const item = (await request.json()) as Omit<HouseholdItem, "_id">;
    item.lastUpdated = new Date();

    const result = await collection.insertOne(item);
    return NextResponse.json(
      { _id: result.insertedId, ...item },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create household item with error " + String(error) },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("flint");
    const collection = db.collection<HouseholdItem>("household_items");

    const item = (await request.json()) as HouseholdItemWithId;
    const { _id, ...updateData } = item;

    if (!_id) {
      return NextResponse.json(
        { error: "Missing _id field for update" },
        { status: 400 },
      );
    }

    updateData.lastUpdated = new Date();

    const query: Filter<HouseholdItem> = {
      _id: _id,
    };

    const result = await collection.updateOne(query, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ _id, ...updateData }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update household item with error " + String(error) },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db("flint");
    const collection = db.collection<HouseholdItem>("household_items");

    // Get the id from the URL search params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing id parameter" },
        { status: 400 },
      );
    }

    const query: Filter<HouseholdItem> = {
      _id: new ObjectId(id),
    };

    const result = await collection.deleteOne(query);

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Item deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete household item with error " + String(error) },
      { status: 500 },
    );
  }
}
