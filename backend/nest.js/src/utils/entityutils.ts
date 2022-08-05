export function isEquals(entity1: any, entity2: any) : boolean {
    if (!entity1 && !entity2)
        return true;
    if (!entity1 || !entity2)
        return false;
    const userFieldsNames1: string[] = Object.keys(entity1)
    const userFieldsNames2: string[] = Object.keys(entity2)

    if (userFieldsNames1.length != userFieldsNames2.length)
        return false;

    // Loop of every fields of type entity1
    for (let field of userFieldsNames1) {
        if (!entity1[field] && !entity2[field])
            continue;
        if (!entity1[field] || !entity2[field])
            return false;
        if (entity1[field] !== entity2[field])
            return false;
    }
    return true;
}
