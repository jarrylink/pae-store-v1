// accessory-db.js - Accessory table operations
const { sql } = require('./db-helper.js');

async function listAccessories() {
    try {
        const accessories = await sql\
            SELECT id, name, description, price, category, sku, unit, stock, "isActive", "createdAt"
            FROM "Accessory"
            ORDER BY id ASC
        \;
        return accessories;
    } catch (error) {
        console.error('? Error fetching accessories:', error.message);
        return [];
    }
}

async function getAccessoryById(id) {
    try {
        const result = await sql\
            SELECT * FROM "Accessory"
            WHERE id = \
        \;
        return result[0] || null;
    } catch (error) {
        console.error(? Error fetching accessory \:, error.message);
        return null;
    }
}

async function createAccessory(data) {
    try {
        const result = await sql\
            INSERT INTO "Accessory" (
                name, description, price, category, image, sku, unit, stock, "isActive"
            ) VALUES (
                \,
                \,
                \,
                \,
                \,
                \,
                \,
                \,
                \
            )
            RETURNING *
        \;
        return result[0];
    } catch (error) {
        console.error('? Error creating accessory:', error.message);
        return null;
    }
}

async function updateAccessory(id, data) {
    try {
        const result = await sql\
            UPDATE "Accessory"
            SET 
                name = COALESCE(\, name),
                description = COALESCE(\, description),
                price = COALESCE(\, price),
                category = COALESCE(\, category),
                image = COALESCE(\, image),
                sku = COALESCE(\, sku),
                unit = COALESCE(\, unit),
                stock = COALESCE(\, stock),
                "isActive" = COALESCE(\, "isActive")
            WHERE id = \
            RETURNING *
        \;
        return result[0];
    } catch (error) {
        console.error(? Error updating accessory \:, error.message);
        return null;
    }
}

async function deleteAccessory(id) {
    try {
        const result = await sql\
            DELETE FROM "Accessory"
            WHERE id = \
            RETURNING id
        \;
        return result.length > 0;
    } catch (error) {
        console.error(? Error deleting accessory \:, error.message);
        return false;
    }
}

// Export functions
module.exports = {
    listAccessories,
    getAccessoryById,
    createAccessory,
    updateAccessory,
    deleteAccessory
};

// If run directly, list all accessories
if (require.main === module) {
    (async () => {
        console.log('?? Listing all accessories...');
        const accessories = await listAccessories();
        console.log(\n?? Found \ accessories:\n);
        if (accessories.length > 0) {
            accessories.forEach(a => {
                console.log(  \. \ - ?\ (\) Stock: \);
            });
        } else {
            console.log('  No accessories found in database.');
        }
    })();
}
