import React, { useMemo } from 'react';

/**
 * Enhanced PedigreeVisualization with proper medical pedigree connections
 * Features:
 * - Hierarchical layout (generations aligned horizontally)
 * - Marriage/partnership lines
 * - Parent-child connections with orthogonal lines
 * - Sibling groupings
 * - Standard medical genetics symbols
 */
export default function PedigreeVisualization({ members }) {
    // Configuration
    const CONFIG = {
        PERSON_SIZE: 50,
        HORIZONTAL_SPACING: 120,
        VERTICAL_SPACING: 140,
        MARRIAGE_LINE_LENGTH: 30,
        SVG_PADDING: 60,
    };

    // Group members by generation and sort
    const generations = useMemo(() => {
        const genMap = new Map();
        members.forEach(member => {
            if (!genMap.has(member.generation)) {
                genMap.set(member.generation, []);
            }
            genMap.get(member.generation).push(member);
        });

        // Sort by generation, then by position within generation
        const sorted = Array.from(genMap.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([gen, mems]) => [gen, mems.sort((a, b) => a.position - b.position)]);

        return sorted;
    }, [members]);

    // Calculate positions for all members
    const positions = useMemo(() => {
        const posMap = new Map();

        generations.forEach(([generation, genMembers], genIndex) => {
            const y = CONFIG.SVG_PADDING + genIndex * CONFIG.VERTICAL_SPACING;
            const totalWidth = genMembers.length * CONFIG.HORIZONTAL_SPACING;
            const startX = CONFIG.SVG_PADDING + 50;

            genMembers.forEach((member, memberIndex) => {
                const x = startX + memberIndex * CONFIG.HORIZONTAL_SPACING;
                posMap.set(member.id, {
                    x,
                    y,
                    member,
                });
            });
        });

        return posMap;
    }, [generations, CONFIG]);

    // Find couples (adjacent members of opposite gender in same generation)
    const couples = useMemo(() => {
        const couplesList = [];

        generations.forEach(([generation, genMembers]) => {
            for (let i = 0; i < genMembers.length - 1; i++) {
                const m1 = genMembers[i];
                const m2 = genMembers[i + 1];

                // Assume consecutive opposite-gender members are couples
                if (m1.gender !== m2.gender) {
                    couplesList.push({
                        partner1: m1.id,
                        partner2: m2.id,
                        generation,
                    });
                }
            }
        });

        return couplesList;
    }, [generations]);

    // Calculate SVG dimensions
    const svgDimensions = useMemo(() => {
        let maxX = 0;
        let maxY = 0;

        positions.forEach(pos => {
            maxX = Math.max(maxX, pos.x);
            maxY = Math.max(maxY, pos.y);
        });

        return {
            width: maxX + CONFIG.PERSON_SIZE + CONFIG.SVG_PADDING,
            height: maxY + CONFIG.PERSON_SIZE + CONFIG.SVG_PADDING,
        };
    }, [positions, CONFIG]);

    // Render symbol based on gender and status
    const renderSymbol = (member, x, y) => {
        const size = CONFIG.PERSON_SIZE;
        const isSquare = member.gender === 'male';
        const isAffected = member.affected;
        const isCarrier = member.carrier;
        const isDeceased = member.deceased;

        // Colors
        const fillColor = isAffected
            ? '#ef4444'
            : 'white';
        const strokeColor = isAffected
            ? '#dc2626'
            : (isSquare ? '#1e40af' : '#be185d');

        return (
            <g key={member.id}>
                {/* Main symbol */}
                {isSquare ? (
                    <rect
                        x={x}
                        y={y}
                        width={size}
                        height={size}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth="3"
                        rx="4"
                    />
                ) : (
                    <circle
                        cx={x + size / 2}
                        cy={y + size / 2}
                        r={size / 2}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth="3"
                    />
                )}

                {/* Carrier indicator (half-filled) */}
                {isCarrier && !isAffected && (
                    <>
                        {isSquare ? (
                            <rect
                                x={x}
                                y={y}
                                width={size / 2}
                                height={size}
                                fill="#f59e0b"
                                rx="4"
                            />
                        ) : (
                            <path
                                d={`M ${x + size / 2} ${y} A ${size / 2} ${size / 2} 0 0 0 ${x + size / 2} ${y + size} Z`}
                                fill="#f59e0b"
                            />
                        )}
                    </>
                )}

                {/* Deceased line */}
                {isDeceased && (
                    <line
                        x1={x}
                        y1={y}
                        x2={x + size}
                        y2={y + size}
                        stroke="#1e293b"
                        strokeWidth="3"
                    />
                )}

                {/* Name label */}
                <text
                    x={x + size / 2}
                    y={y + size + 20}
                    textAnchor="middle"
                    fill="#1e293b"
                    fontSize="13"
                    fontWeight="600"
                    fontFamily="Bricolage Grotesque"
                >
                    {member.name}
                </text>

                {/* Status labels */}
                {(isAffected || isCarrier) && (
                    <text
                        x={x + size / 2}
                        y={y + size + 35}
                        textAnchor="middle"
                        fill="#64748b"
                        fontSize="10"
                        fontFamily="Bricolage Grotesque"
                    >
                        {isAffected ? 'Affected' : 'Carrier'}
                    </text>
                )}
            </g>
        );
    };

    // Render marriage lines
    const renderMarriageLines = () => {
        return couples.map((couple, index) => {
            const pos1 = positions.get(couple.partner1);
            const pos2 = positions.get(couple.partner2);

            if (!pos1 || !pos2) return null;

            const x1 = pos1.x + CONFIG.PERSON_SIZE / 2;
            const x2 = pos2.x + CONFIG.PERSON_SIZE / 2;
            const y = pos1.y + CONFIG.PERSON_SIZE / 2;

            return (
                <g key={`marriage-${index}`}>
                    {/* Horizontal marriage line */}
                    <line
                        x1={x1}
                        y1={y}
                        x2={x2}
                        y2={y}
                        stroke="#64748b"
                        strokeWidth="2.5"
                    />
                    {/* Midpoint marker for offspring */}
                    <circle
                        cx={(x1 + x2) / 2}
                        cy={y}
                        r="4"
                        fill="#64748b"
                    />
                </g>
            );
        });
    };

    // Render parent-child connections
    const renderParentChildLines = () => {
        const lines = [];

        generations.forEach(([genNum, genMembers], genIndex) => {
            if (genIndex >= generations.length - 1) return;

            const nextGenNum = generations[genIndex + 1][0];
            const nextGenMembers = generations[genIndex + 1][1];

            // For each couple in current generation
            couples.forEach(couple => {
                if (couple.generation !== genNum) return;

                const pos1 = positions.get(couple.partner1);
                const pos2 = positions.get(couple.partner2);

                if (!pos1 || !pos2) return;

                const marriageMidX = (pos1.x + pos2.x + CONFIG.PERSON_SIZE) / 2;
                const parentY = pos1.y + CONFIG.PERSON_SIZE / 2;
                const dropY = parentY + 30; // Drop down from marriage line

                // Find children (simplified: children at nearby positions in next gen)
                const children = nextGenMembers.filter(child => {
                    const childPos = positions.get(child.id);
                    if (!childPos) return false;
                    const childX = childPos.x + CONFIG.PERSON_SIZE / 2;
                    return Math.abs(childX - marriageMidX) < CONFIG.HORIZONTAL_SPACING * 1.5;
                });

                if (children.length === 0) return;

                // Vertical line down from marriage
                lines.push(
                    <line
                        key={`parent-drop-${couple.partner1}-${couple.partner2}`}
                        x1={marriageMidX}
                        y1={parentY}
                        x2={marriageMidX}
                        y2={dropY}
                        stroke="#64748b"
                        strokeWidth="2.5"
                    />
                );

                // Horizontal sibling connector line
                if (children.length > 1) {
                    const childPositions = children.map(c => positions.get(c.id));
                    const minX = Math.min(...childPositions.map(p => p.x + CONFIG.PERSON_SIZE / 2));
                    const maxX = Math.max(...childPositions.map(p => p.x + CONFIG.PERSON_SIZE / 2));

                    lines.push(
                        <line
                            key={`sibling-connector-${couple.partner1}-${couple.partner2}`}
                            x1={minX}
                            y1={dropY}
                            x2={maxX}
                            y2={dropY}
                            stroke="#64748b"
                            strokeWidth="2.5"
                        />
                    );
                }

                // Vertical lines to each child
                children.forEach(child => {
                    const childPos = positions.get(child.id);
                    if (!childPos) return;

                    const childX = childPos.x + CONFIG.PERSON_SIZE / 2;

                    lines.push(
                        <line
                            key={`child-line-${child.id}`}
                            x1={childX}
                            y1={dropY}
                            x2={childX}
                            y2={childPos.y}
                            stroke="#64748b"
                            strokeWidth="2.5"
                        />
                    );
                });
            });
        });

        return lines;
    };

    return (
        <svg
            width={svgDimensions.width}
            height={svgDimensions.height}
            className="w-full h-auto"
            style={{ minHeight: '300px' }}
        >
            {/* Render connections first (behind symbols) */}
            {renderMarriageLines()}
            {renderParentChildLines()}

            {/* Render person symbols */}
            {Array.from(positions.values()).map(({ x, y, member }) =>
                renderSymbol(member, x, y)
            )}
        </svg>
    );
}
