import {
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  doc,
  getDoc,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  deleteDoc,
  where,
  getDocs,
  query,
} from '@firebase/firestore';

import { db } from '@/lib/firebase';
import { PantryItem } from '@/models/PantryItem';

export class FirestoreService {
  private pantryCollection = collection(db, 'pantry');
  // Firestore data convertor
  private pantryItemConvertor: FirestoreDataConverter<PantryItem> = {
    toFirestore: (item: PantryItem) => {
      return {
        userId: item.userId,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category,
        expirationDate: item.expirationDate,
        purchaseDate: item.purchaseDate,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        imagePath: item.imagePath,
        notes: item.notes,
      };
    },
    fromFirestore: (
      snapshot: QueryDocumentSnapshot,
      options: SnapshotOptions
    ) => {
      const data = snapshot.data(options);
      {
        return new PantryItem(
          data.userId,
          data.name,
          data.quantity,
          data.unit,
          data.category,
          data.expirationDate.toDate(),
          data.purchaseDate.toDate(),
          data.createdAt,
          data.updatedAt,
          data.imagePath,
          data.notes
        );
      }
    },
  };
  // add a new item
  async addItem(item: PantryItem): Promise<string> {
    const docRef = await addDoc(
      this.pantryCollection.withConverter(this.pantryItemConvertor),
      {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
    );
    console.log(`New Item Added Successfully - {docRef.id}`);
    return docRef.id;
  }

  // update an existing item
  async updateItem(itemId: string, item: PantryItem): Promise<string> {
    // Get a reference to the Document
    const docRef = doc(
      this.pantryCollection.withConverter(this.pantryItemConvertor),
      itemId
    );

    // Update the document
    await updateDoc(docRef, {
      ...item,
      updatedAt: serverTimestamp(),
    });

    console.log(`Item with id - {docRef.id} updated Successfully`);
    return docRef.id;
  }

  // retrieve a pantry item
  async getItem(itemId: string): Promise<PantryItem | null> {
    const docRef = doc(
      this.pantryCollection.withConverter(this.pantryItemConvertor),
      itemId
    );
    const itemRetrieved = await getDoc(docRef);
    if (itemRetrieved.exists()) {
      return itemRetrieved.data();
    }
    return null; // item no found
  }

  // retrieve all pantry item for user
  async getAllItems(userId: string): Promise<PantryItem[]> {
    const queryAllItemsForUser = query(
      this.pantryCollection.withConverter(this.pantryItemConvertor),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(queryAllItemsForUser);
    const pantryItems = querySnapshot.docs.map((doc) => doc.data());
    console.log(`List of Items retrieved: {pantryItems}`);
    return pantryItems;
  }

  // Delete an item
  async deleteItem(itemId: string): Promise<string> {
    const docRef = doc(
      this.pantryCollection.withConverter(this.pantryItemConvertor),
      itemId
    );

    // Delete Firestore Document
    await deleteDoc(docRef);
    console.log(`Item with id - {docRef.id} deleted successfully`);
    return docRef.id;
  }
}
