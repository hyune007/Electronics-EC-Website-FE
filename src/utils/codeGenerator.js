/**
 * Utility functions for auto-generating IDs
 */

/**
 * Generate the next ID based on existing IDs
 * @param {Array} existingIds - Array of existing IDs (e.g., ["SP001", "SP002", "SP005"])
 * @param {string} prefix - Prefix for the ID (e.g., "SP", "KH", "NV")
 * @param {number} digits - Number of digits (default: 3)
 * @returns {string} Next ID (e.g., "SP006")
 */
export function generateNextId(existingIds, prefix, digits = 3) {
    if (!existingIds || existingIds.length === 0) {
        return `${prefix}${'0'.repeat(digits - 1)}1`;
    }

    // Extract numbers from existing IDs
    const numbers = existingIds
        .filter(id => id && typeof id === 'string')
        .map(id => {
            const match = id.match(new RegExp(`^${prefix}(\\d+)$`));
            return match ? parseInt(match[1], 10) : 0;
        })
        .filter(num => !isNaN(num) && num > 0);

    // Find the maximum number
    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
    
    // Generate next number
    const nextNumber = maxNumber + 1;
    
    // Format with leading zeros
    return `${prefix}${String(nextNumber).padStart(digits, '0')}`;
}

/**
 * Generate next ID by inferring prefix and digit length from existing IDs.
 * Falls back to provided prefix/digits when no valid IDs are found.
 */
export function generateSmartNextId(existingIds, fallbackPrefix = "ID", fallbackDigits = 3) {
    const validIds = (existingIds || []).filter(id => typeof id === "string");

    const samples = validIds
        .map(id => id.match(/^([A-Za-z]+)(\d+)$/))
        .filter(Boolean);

    if (samples.length === 0) {
        return generateNextId(validIds, fallbackPrefix, fallbackDigits);
    }

    const [prefix, digitsPart] = samples[0].slice(1);
    const digits = Math.max(digitsPart.length, fallbackDigits);
    return generateNextId(validIds, prefix, digits);
}

/**
 * Generate next product ID (SP001, SP002, ...)
 */
export function generateNextProductId(existingProducts) {
    const ids = existingProducts.map(p => p.sp_id || p.id);
    return generateNextId(ids, 'SP', 3);
}

/**
 * Generate next customer ID (KH001, KH002, ...)
 */
export function generateNextCustomerId(existingCustomers) {
    const ids = existingCustomers.map(c => c.kh_id || c.id);
    return generateNextId(ids, 'KH', 3);
}

/**
 * Generate next employee ID (NV001, NV002, ...)
 */
export function generateNextEmployeeId(existingEmployees) {
    const ids = existingEmployees.map(e => e.nv_id || e.id);
    return generateNextId(ids, 'NV', 3);
}

/**
 * Generate next brand ID (BR001, BR002, ...)
 */
export function generateNextBrandId(existingBrands) {
    const ids = existingBrands.map(b => b.hang_id || b.id);
    return generateNextId(ids, 'BR', 3);
}

/**
 * Generate next voucher ID (KM001, KM002, ...)
 */
export function generateNextVoucherId(existingVouchers) {
    const ids = existingVouchers.map(v => v.km_id || v.id);
    return generateNextId(ids, 'KM', 3);
}

/**
 * Generate next import ID (NK001, NK002, ...)
 */
export function generateNextImportId(existingImports) {
    const ids = existingImports.map(i => i.nk_id || i.id);
    return generateNextId(ids, 'NK', 3);
}
