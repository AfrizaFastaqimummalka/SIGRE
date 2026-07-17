import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const south = searchParams.get("south");
    const west = searchParams.get("west");
    const north = searchParams.get("north");
    const east = searchParams.get("east");

    const apiKey = process.env.GEOAPIFY_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: "GEOAPIFY_API_KEY belum diisi di .env.local" },
            { status: 500 }
        );
    }

    if (!south || !west || !north || !east) {
        return NextResponse.json(
            { error: "Parameter south, west, north, east wajib dikirim" },
            { status: 400 }
        );
    }

    const categories = [
        "religion",
        "religion.place_of_worship",
        "religion.place_of_worship.islam",
        "religion.place_of_worship.christianity",
        "building.place_of_worship",

        "commercial",
        "commercial.supermarket",
        "commercial.convenience",
        "commercial.marketplace",
        "commercial.shopping_mall",

        "catering",
        "catering.restaurant",
        "catering.cafe",
        "catering.fast_food",
        "catering.food_court",

        "service",
        "healthcare",
        "education",
        "tourism",
        "entertainment",
        "leisure",
        "office",
        "public_transport",
        "amenity"
    ].join(",");

    const allFeatures: any[] = [];
    const seen = new Set<string>();

    try {
        // Ambil beberapa halaman data, bukan cuma sekali.
        for (const offset of [0, 100, 200]) {
            const url = new URL("https://api.geoapify.com/v2/places");

            url.searchParams.set("categories", categories);
            url.searchParams.set("filter", `rect:${west},${north},${east},${south}`);
            url.searchParams.set("limit", "100");
            url.searchParams.set("offset", String(offset));
            url.searchParams.set("lang", "id");
            url.searchParams.set("apiKey", apiKey);

            const response = await fetch(url.toString(), {
                headers: {
                    Accept: "application/json",
                },
                cache: "no-store",
            });

            const text = await response.text();

            if (!response.ok) {
                return NextResponse.json(
                    {
                        error: "Gagal mengambil data dari Geoapify",
                        status: response.status,
                        detail: text,
                    },
                    { status: response.status }
                );
            }

            const data = JSON.parse(text);
            const features = data.features ?? [];

            for (const feature of features) {
                const id =
                    feature.properties?.place_id ??
                    `${feature.geometry?.coordinates?.[0]}-${feature.geometry?.coordinates?.[1]}`;

                if (!seen.has(id)) {
                    seen.add(id);
                    allFeatures.push(feature);
                }
            }

            // Kalau hasil halaman ini kurang dari 100, berarti tidak perlu lanjut offset berikutnya.
            if (features.length < 100) break;
        }

        return NextResponse.json({
            count: allFeatures.length,
            features: allFeatures,
        });
    } catch (error) {
        return NextResponse.json(
            {
                error: "Terjadi kesalahan server saat mengambil data Geoapify",
            },
            { status: 500 }
        );
    }
}