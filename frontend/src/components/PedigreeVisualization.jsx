import React, { useMemo } from 'react';

export default function PedigreeVisualization({ members }) {
    const CONFIG = {
        PERSON_SIZE: 55,
        HORIZONTAL_SPACING: 140,
        VERTICAL_SPACING: 160,
        SVG_PADDING: 80,
        MARRIAGE_LINE_GAP: 15,
    };

    // Group by generation and calculate proper positions
    const layout = useMemo(() => {
        const generationMap = new Map();

        // Group by generation
        members.forEach(member => {
            if (!generationMap.has(member.generation)) {
                generationMap.set(member.generation, []);
            }
            generationMap.get(member.generation).push(member);
        });

        // Sort generations
        const sortedGenerations = Array.from(generationMap.entries())
            .sort((a, b) => a[0] - b[0]);

        // Find couples (people with spouse_id)
        const couples = [];
        const processedSpouses = new Set();

        members.forEach(member => {
            if (member.spouse_id && !processedSpouses.has(member.id)) {
                const spouse = members.find(m => m.id === member.spouse_id);
                if (spouse) {
                    couples.push({
                        id: `couple_${member.id}_${spouse.id}`,
                        partner1: member,
                        partner2: spouse,
                    });
                    processedSpouses.add(member.id);
                    processedSpouses.add(spouse.id);
                }
            }
        });

        // Calculate positions with family grouping
        const positions = new Map();
        let currentX = CONFIG.SVG_PADDING;

        sortedGenerations.forEach(([genNum, genMembers], genIndex) => {
            const y = CONFIG.SVG_PADDING + genIndex * CONFIG.VERTICAL_SPACING;

            // Group members: couples together, then singles
            const arranged = [];
            const processed = new Set();

            // Add couples first
            couples.forEach(couple => {
                if (couple.partner1.generation === genNum && !processed.has(couple.partner1.id)) {
                    arranged.push(couple.partner1);
                    arranged.push(couple.partner2);
                    processed.add(couple.partner1.id);
                    processed.add(couple.partner2.id);
                }
            });

            // Add singles
            genMembers.forEach(member => {
                if (!processed.has(member.id)) {
                    arranged.push(member);
                    processed.add(member.id);
                }
            });

            // Position members
            let x = currentX;
            arranged.forEach((member, idx) => {
                positions.set(member.id, { x, y });

                // Check if next member is spouse
                const nextMember = arranged[idx + 1];
                if (nextMember && member.spouse_id === nextMember.id) {
                    x += CONFIG.HORIZONTAL_SPACING * 0.7; // Closer spacing for couples
                } else {
                    x += CONFIG.HORIZONTAL_SPACING;
                }
            });
        });

        return { positions, couples, generations: sortedGenerations };
    }, [members, CONFIG]);

    // Calculate SVG dimensions
    const svgDimensions = useMemo(() => {
        let maxX = 0;
        let maxY = 0;

        layout.positions.forEach(pos => {
            maxX = Math.max(maxX, pos.x);
            maxY = Math.max(maxY, pos.y);
        });

        return {
            width: Math.max(800, maxX + CONFIG.PERSON_SIZE + CONFIG.SVG_PADDING * 2),
            height: Math.max(400, maxY + CONFIG.PERSON_SIZE + CONFIG.SVG_PADDING * 2),
        };
    }, [layout, CONFIG]);

    // Render person symbol
    const renderPerson = (member) => {
        const pos = layout.positions.get(member.id);
        if (!pos) return null;

        const { x, y } = pos;
        const size = CONFIG.PERSON_SIZE;
        const isSquare = member.gender === 'male';

        // Colors
        const fillColor = member.affected ? '#ef4444' : 'white';
        const strokeColor = member.affected
            ? '#dc2626'
            : (isSquare ? '#2563eb' : '#db2777');

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
                        rx="6"
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                ) : (
                    <circle
                        cx={x + size / 2}
                        cy={y + size / 2}
                        r={size / 2}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth="3"
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                )}

                {/* Carrier indicator */}
                {member.carrier && !member.affected && (
                    <>
                        {isSquare ? (
                            <rect
                                x={x}
                                y={y}
                                width={size / 2}
                                height={size}
                                fill="#f59e0b"
                                rx="6"
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
                {member.deceased && (
                    <line
                        x1={x}
                        y1={y}
                        x2={x + size}
                        y2={y + size}
                        stroke="#334155"
                        strokeWidth="3"
                    />
                )}

                {/* Name */}
                <text
                    x={x + size / 2}
                    y={y + size + 18}
                    textAnchor="middle"
                    fill="#1e293b"
                    fontSize="13"
                    fontWeight="600"
                    fontFamily="system-ui, -apple-system, sans-serif"
                >
                    {member.name}
                </text>

                {/* Age or status */}
                {(member.age || member.affected || member.carrier) && (
                    <text
                        x={x + size / 2}
                        y={y + size + 33}
                        textAnchor="middle"
                        fill="#64748b"
                        fontSize="11"
                        fontFamily="system-ui, -apple-system, sans-serif"
                    >
                        {member.age ? `${member.age}y` : member.affected ? 'Affected' : member.carrier ? 'Carrier' : 'Unaffected'}
                    </text>
                )}
            </g>
        );
    };

    // Render marriage lines
    const renderMarriageLines = () => {
        return layout.couples.map(couple => {
            const pos1 = layout.positions.get(couple.partner1.id);
            const pos2 = layout.positions.get(couple.partner2.id);

            if (!pos1 || !pos2) return null;

            const x1 = pos1.x + CONFIG.PERSON_SIZE / 2;
            const x2 = pos2.x + CONFIG.PERSON_SIZE / 2;
            const y = pos1.y + CONFIG.PERSON_SIZE / 2;

            const midX = (x1 + x2) / 2;

            return (
                <g key={couple.id}>
                    {/* Marriage line */}
                    <line
                        x1={x1}
                        y1={y}
                        x2={x2}
                        y2={y}
                        stroke="#64748b"
                        strokeWidth="3"
                        className="marriage-line"
                    />

                    {/* Midpoint for offspring connection */}
                    <circle
                        cx={midX}
                        cy={y}
                        r="5"
                        fill="#64748b"
                    />
                </g>
            );
        });
    };

    // Render parent-child connections
    const renderFamilyConnections = () => {
        const lines = [];

        // For each couple, draw connections to their children
        layout.couples.forEach(couple => {
            const pos1 = layout.positions.get(couple.partner1.id);
            const pos2 = layout.positions.get(couple.partner2.id);

            if (!pos1 || !pos2) return;

            const midX = (pos1.x + pos2.x + CONFIG.PERSON_SIZE) / 2; // Fixed calculation
            const parentY = pos1.y + CONFIG.PERSON_SIZE / 2;

            // Find children
            const children = members.filter(m =>
                (m.mother_id === couple.partner1.id || m.mother_id === couple.partner2.id) ||
                (m.father_id === couple.partner1.id || m.father_id === couple.partner2.id)
            );

            if (children.length === 0) return;

            // Vertical drop from marriage line
            const dropY = parentY + 40;

            lines.push(
                <line
                    key={`drop-${couple.id}`}
                    x1={midX}
                    y1={parentY}
                    x2={midX}
                    y2={dropY}
                    stroke="#64748b"
                    strokeWidth="3"
                />
            );

            // Horizontal sibling line
            if (children.length > 1) {
                const childXs = children
                    .map(c => layout.positions.get(c.id))
                    .filter(Boolean)
                    .map(p => p.x + CONFIG.PERSON_SIZE / 2);

                const minX = Math.min(...childXs);
                const maxX = Math.max(...childXs);

                lines.push(
                    <line
                        key={`sibling-${couple.id}`}
                        x1={minX}
                        y1={dropY}
                        x2={maxX}
                        y2={dropY}
                        stroke="#64748b"
                        strokeWidth="3"
                    />
                );
            }

            // Vertical lines to each child
            children.forEach(child => {
                const childPos = layout.positions.get(child.id);
                if (!childPos) return;

                const childX = childPos.x + CONFIG.PERSON_SIZE / 2;

                lines.push(
                    <line
                        key={`child-${child.id}`}
                        x1={childX}
                        y1={dropY}
                        x2={childX}
                        y2={childPos.y}
                        stroke="#64748b"
                        strokeWidth="3"
                    />
                );
            });
        });

        // Also handle single parents (if any member has mother_id or father_id but those parents aren't couples)
        members.forEach(member => {
            if (!member.mother_id && !member.father_id) return;

            const isChildOfCouple = layout.couples.some(couple =>
                (couple.partner1.id === member.mother_id || couple.partner1.id === member.father_id) &&
                (couple.partner2.id === member.mother_id || couple.partner2.id === member.father_id)
            );

            if (isChildOfCouple) return; // Already handled above

            // Draw connection to single parent
            const parentId = member.mother_id || member.father_id;
            const parentPos = layout.positions.get(parentId);
            const childPos = layout.positions.get(member.id);

            if (!parentPos || !childPos) return;

            const parentX = parentPos.x + CONFIG.PERSON_SIZE / 2;
            const parentY = parentPos.y + CONFIG.PERSON_SIZE;
            const childX = childPos.x + CONFIG.PERSON_SIZE / 2;
            const childY = childPos.y;

            lines.push(
                <g key={`single-parent-${member.id}`}>
                    <line
                        x1={parentX}
                        y1={parentY}
                        x2={parentX}
                        y2={parentY + 30}
                        stroke="#64748b"
                        strokeWidth="2.5"
                        strokeDasharray="5,5"
                    />
                    <line
                        x1={parentX}
                        y1={parentY + 30}
                        x2={childX}
                        y2={parentY + 30}
                        stroke="#64748b"
                        strokeWidth="2.5"
                        strokeDasharray="5,5"
                    />
                    <line
                        x1={childX}
                        y1={parentY + 30}
                        x2={childX}
                        y2={childY}
                        stroke="#64748b"
                        strokeWidth="2.5"
                        strokeDasharray="5,5"
                    />
                </g>
            );
        });

        return lines;
    };

    // Render generation labels
    const renderGenerationLabels = () => {
        return layout.generations.map(([genNum, genMembers]) => {
            const firstMember = genMembers[0];
            const pos = layout.positions.get(firstMember.id);

            if (!pos) return null;

            return (
                <text
                    key={`gen-label-${genNum}`}
                    x={CONFIG.SVG_PADDING / 2}
                    y={pos.y + CONFIG.PERSON_SIZE / 2}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="14"
                    fontWeight="700"
                    fontFamily="system-ui, -apple-system, sans-serif"
                >
                    {genNum === 0 ? 'I' : genNum === 1 ? 'II' : genNum === 2 ? 'III' : `Gen ${genNum + 1}`}
                </text>
            );
        });
    };

    if (members.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-400">
                <p>No family members to display</p>
            </div>
        );
    }

    return (
        <div className="w-full overflow-auto">
            <svg
                width={svgDimensions.width}
                height={svgDimensions.height}
                className="mx-auto"
                style={{ minHeight: '300px' }}
            >
                {/* Background */}
                <rect
                    width={svgDimensions.width}
                    height={svgDimensions.height}
                    fill="white"
                    opacity="0.5"
                />

                {/* Render in correct order: connections, then symbols */}
                <g className="connections">
                    {renderMarriageLines()}
                    {renderFamilyConnections()}
                </g>

                <g className="generation-labels">
                    {renderGenerationLabels()}
                </g>

                <g className="persons">
                    {members.map(member => renderPerson(member))}
                </g>
            </svg>
        </div>
    );
}
