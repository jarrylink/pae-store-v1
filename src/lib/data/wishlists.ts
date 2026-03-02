import { WishlistItem } from '@/types/auth';

export interface Wishlist {
  userId: string;
  items: WishlistItem[];
}

export const WISHLISTS: Wishlist[] = [
  {
    "userId": "customer-001",
    "items": [
      {
        "id": "wl-1772025051799-r6agniglc",
        "productId": 6,
        "addedAt": "2026-02-25T13:10:51.799Z"
      },
      {
        "id": "wl-1772025053201-dk0n4be3t",
        "productId": 5,
        "addedAt": "2026-02-25T13:10:53.201Z"
      }
    ]
  },
  {
    "userId": "staff-001",
    "items": [
      {
        "id": "wl-004",
        "productId": 2,
        "addedAt": "2024-11-30T16:20:00Z"
      },
      {
        "id": "wl-005",
        "productId": 4,
        "addedAt": "2024-12-01T11:10:00Z"
      }
    ]
  },
  {
    "userId": "user-1772001830294-tly6d7e9s",
    "items": [
      {
        "id": "wl-1772025346872-lxxe46gfq",
        "productId": 7,
        "addedAt": "2026-02-25T13:15:46.872Z"
      }
    ]
  },
  {
    "userId": "google-1772025174651-x9m8y6s6c",
    "items": []
  },
  {
    "userId": "user-1772111899737-j6dlobt80",
    "items": [
      {
        "id": "wl-1772111961980-z70lyx7eb",
        "productId": 6,
        "addedAt": "2026-02-26T13:19:21.980Z"
      },
      {
        "id": "wl-1772111963224-ib53o995n",
        "productId": 7,
        "addedAt": "2026-02-26T13:19:23.224Z"
      }
    ]
  },
  {
    "userId": "user-1772200023648-zbzvjsegb",
    "items": []
  }
];
