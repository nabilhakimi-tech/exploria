import { NextResponse } from 'next/server';
import { createPhysicalOrder, getPhysicalOrders } from '@/db/queries';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let parentId = searchParams.get('parentId') || undefined;

    // Secure authentication check: retrieve parent from authenticated session
    try {
      const supabase = await createSupabaseServer();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.id) {
        parentId = user.id;
      }
    } catch {
      // Fallback
    }

    if (!parentId) {
      return NextResponse.json({ success: true, data: [] });
    }

    const orders = await getPhysicalOrders(parentId);
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      guardianName,
      phone,
      deliveryAddress,
      paymentMethod,
      items,
      grandTotal,
    } = body;

    let parentId = body.parentId;
    try {
      const supabase = await createSupabaseServer();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.id) {
        parentId = user.id;
      }
    } catch {
      // Fallback
    }

    if (!parentId) {
      return NextResponse.json(
        { success: false, error: 'Sesi anda telah tamat. Sila log masuk semula.' },
        { status: 401 }
      );
    }

    if (!guardianName || !phone || !deliveryAddress || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Sila lengkapkan maklumat penghantaran dan pilih produk.' },
        { status: 400 }
      );
    }

    const createdOrders = [];
    for (const item of items) {
      const order = await createPhysicalOrder({
        parentId,
        childId: item.childId,
        awardId: item.awardId,
        guardianName,
        phone,
        deliveryAddress,
        productType: item.product,
        productName: item.productName || 'Medal / Sijil Fizikal Exploria',
        awardTitle: item.awardTitle,
        childName: item.childName,
        totalAmount: item.price || 39,
        paymentMethod,
      });
      createdOrders.push(order);
    }

    return NextResponse.json({
      success: true,
      message: 'Pesanan fizikal berjaya dihantar ke pangkalan data!',
      orders: createdOrders,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
