/**
 * chessKnowledge.js — Chess Strategy Knowledge Base for RAG
 *
 * 55 entries covering openings, tactical motifs, endgame concepts,
 * strategic themes, and common mistakes. Each entry is embedded into
 * the vector store for retrieval-augmented generation (RAG).
 */

const chessKnowledge = [
  // ═══════════════════════════════════════════════════════════════════
  // OPENINGS (20 entries)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'opening-sicilian',
    category: 'opening',
    title: 'Sicilian Defense',
    content:
      'The Sicilian Defense (1.e4 c5) is the most popular response to 1.e4 at the highest levels. ' +
      'Black immediately fights for the center with a flank pawn, creating asymmetric positions rich in tactical possibilities. ' +
      'Major variations include the Najdorf, Dragon, and Sveshnikov, each with distinct strategic ideas. ' +
      'White often attacks on the kingside while Black seeks counterplay on the queenside.',
  },
  {
    id: 'opening-ruy-lopez',
    category: 'opening',
    title: 'Ruy Lopez (Spanish Game)',
    content:
      'The Ruy Lopez (1.e4 e5 2.Nf3 Nc6 3.Bb5) is one of the oldest and most respected openings in chess. ' +
      'White puts immediate pressure on the knight defending e5, creating long-term strategic tension. ' +
      'The Morphy Defense (3...a6) is the most common reply, leading to rich middlegame positions. ' +
      'This opening rewards deep understanding of pawn structures and piece maneuvering.',
  },
  {
    id: 'opening-italian',
    category: 'opening',
    title: 'Italian Game (Giuoco Piano)',
    content:
      'The Italian Game (1.e4 e5 2.Nf3 Nc6 3.Bc4) targets the f7 square and aims for rapid piece development. ' +
      'The Giuoco Piano ("Quiet Game") leads to solid, strategic positions, while the Evans Gambit offers aggressive pawn sacrifices. ' +
      'This opening is excellent for beginners learning development principles and center control.',
  },
  {
    id: 'opening-french',
    category: 'opening',
    title: 'French Defense',
    content:
      'The French Defense (1.e4 e6) creates a solid but somewhat cramped position for Black. ' +
      'After 2.d4 d5, Black challenges the center directly but the light-squared bishop is often blocked behind the pawn chain. ' +
      'Key variations include the Winawer (3.Nc3 Bb4), Classical (3.Nc3 Nf6), and Advance (3.e5). ' +
      'Black typically seeks counterplay with ...c5 to undermine White\'s center.',
  },
  {
    id: 'opening-caro-kann',
    category: 'opening',
    title: 'Caro-Kann Defense',
    content:
      'The Caro-Kann Defense (1.e4 c6) is a solid, reliable opening that avoids the cramped positions of the French. ' +
      'After 2.d4 d5, Black maintains a clear path for the light-squared bishop. ' +
      'The Advance Variation (3.e5), Classical (3.Nc3 dxe4 4.Nxe4), and Exchange variations are the main lines. ' +
      'This opening is favored by players who prefer solid positions with fewer tactical complications.',
  },
  {
    id: 'opening-queens-gambit',
    category: 'opening',
    title: 'Queen\'s Gambit',
    content:
      'The Queen\'s Gambit (1.d4 d5 2.c4) is one of the most classical openings in chess. ' +
      'White offers a pawn to gain central control, though Black can accept (QGA) or decline (QGD). ' +
      'In the QGD, Black maintains a solid pawn center with ...e6 but must solve the problem of the light-squared bishop. ' +
      'This opening leads to rich strategic battles centered around pawn structure and piece activity.',
  },
  {
    id: 'opening-kings-indian',
    category: 'opening',
    title: 'King\'s Indian Defense',
    content:
      'The King\'s Indian Defense (1.d4 Nf6 2.c4 g6) is a hypermodern opening where Black allows White to build a big center, ' +
      'then attacks it with ...e5 or ...c5. The Classical Variation often leads to opposite-side attacks — White pushes on the ' +
      'queenside while Black storms the kingside. This opening is combative and requires precise tactical calculation.',
  },
  {
    id: 'opening-nimzo-indian',
    category: 'opening',
    title: 'Nimzo-Indian Defense',
    content:
      'The Nimzo-Indian Defense (1.d4 Nf6 2.c4 e6 3.Nc3 Bb4) is one of the most respected openings against 1.d4. ' +
      'Black pins the knight on c3 to control e4 and is willing to give up the bishop pair for structural concessions. ' +
      'White often ends up with doubled c-pawns but gains the bishop pair. ' +
      'This opening is rich in strategic nuances and is favored by positional players.',
  },
  {
    id: 'opening-slav',
    category: 'opening',
    title: 'Slav Defense',
    content:
      'The Slav Defense (1.d4 d5 2.c4 c6) supports the d5 pawn solidly while keeping the light-squared bishop free. ' +
      'Unlike the QGD, the bishop can develop to f5 or g4 without being blocked. ' +
      'The Semi-Slav (with ...e6) leads to extremely sharp positions like the Meran and Anti-Meran variations. ' +
      'This is a robust choice at all levels of play.',
  },
  {
    id: 'opening-english',
    category: 'opening',
    title: 'English Opening',
    content:
      'The English Opening (1.c4) is a flexible, hypermodern system where White controls the center from the flank. ' +
      'It can transpose into many d4 openings or lead to unique Reversed Sicilian structures. ' +
      'White often fianchettoes the kingside bishop and builds a flexible pawn structure. ' +
      'This opening is excellent for players who want to avoid heavily theoretical main lines.',
  },
  {
    id: 'opening-london',
    category: 'opening',
    title: 'London System',
    content:
      'The London System (1.d4 followed by 2.Bf4) is a solid, systematic opening where White develops the bishop before playing e3. ' +
      'It leads to safe, strategically clear positions and avoids most of Black\'s theoretical preparation. ' +
      'White builds a pyramid pawn structure (d4-e3-c3) and aims for a kingside attack. ' +
      'Popular at club level for its simplicity and reliability.',
  },
  {
    id: 'opening-catalan',
    category: 'opening',
    title: 'Catalan Opening',
    content:
      'The Catalan (1.d4 Nf6 2.c4 e6 3.g3) combines Queen\'s Gambit ideas with a fianchettoed bishop on g2. ' +
      'The g2 bishop exerts long-term pressure on the queenside along the long diagonal. ' +
      'White often sacrifices the c4 pawn for lasting positional compensation. ' +
      'This opening is a favorite of top grandmasters like Kramnik and Carlsen.',
  },
  {
    id: 'opening-dutch',
    category: 'opening',
    title: 'Dutch Defense',
    content:
      'The Dutch Defense (1.d4 f5) is an ambitious, unbalancing response to 1.d4. ' +
      'Black immediately fights for control of the e4 square but weakens the kingside. ' +
      'The Stonewall (with ...d5, ...e6, ...f5) creates a rigid but solid structure for Black. ' +
      'The Leningrad variation (with ...g6) aims for a King\'s Indian-like kingside attack.',
  },
  {
    id: 'opening-pirc',
    category: 'opening',
    title: 'Pirc Defense',
    content:
      'The Pirc Defense (1.e4 d6 2.d4 Nf6 3.Nc3 g6) is a hypermodern opening where Black invites White to build a broad center. ' +
      'Black plans to fianchetto the dark-squared bishop and attack the center with ...e5 or ...c5. ' +
      'White has several aggressive systems including the Austrian Attack (f4). ' +
      'This opening requires accurate play from Black to avoid getting steamrolled in the center.',
  },
  {
    id: 'opening-scandinavian',
    category: 'opening',
    title: 'Scandinavian Defense',
    content:
      'The Scandinavian Defense (1.e4 d5) immediately challenges White\'s e-pawn. ' +
      'After 2.exd5 Qxd5, Black\'s queen comes out early but can be chased with tempo by Nc3. ' +
      'The modern 2...Nf6 variation avoids early queen exposure. ' +
      'This opening is simple and solid, popular among club players who want to avoid heavy theory.',
  },
  {
    id: 'opening-grunfeld',
    category: 'opening',
    title: 'Grünfeld Defense',
    content:
      'The Grünfeld Defense (1.d4 Nf6 2.c4 g6 3.Nc3 d5) is a dynamic opening where Black strikes at the center immediately. ' +
      'Black allows White to build a big pawn center, then attacks it with pieces and the ...c5 break. ' +
      'The Exchange Variation (4.cxd5 Nxd5 5.e4) leads to sharp positions where Black targets the d4 pawn. ' +
      'This opening rewards tactical skill and deep understanding of dynamic piece play.',
  },
  {
    id: 'opening-petroff',
    category: 'opening',
    title: 'Petrov\'s Defense (Russian Game)',
    content:
      'Petrov\'s Defense (1.e4 e5 2.Nf3 Nf6) is one of the most solid responses to 1.e4 e5. ' +
      'Instead of defending the e5 pawn, Black counterattacks the e4 pawn symmetrically. ' +
      'It tends to lead to simplified, drawish positions at the highest level. ' +
      'Players who choose the Petrov value solidity and are comfortable in endgames.',
  },
  {
    id: 'opening-vienna',
    category: 'opening',
    title: 'Vienna Game',
    content:
      'The Vienna Game (1.e4 e5 2.Nc3) is a flexible alternative to the more common 2.Nf3. ' +
      'White prepares f2-f4 (the Vienna Gambit) or a slow buildup with Bc4 and d3. ' +
      'The Vienna Gambit can lead to wild tactical positions after 2...Nf6 3.f4. ' +
      'This opening is a good surprise weapon that avoids the heavily analyzed Ruy Lopez and Italian lines.',
  },
  {
    id: 'opening-kings-gambit',
    category: 'opening',
    title: 'King\'s Gambit',
    content:
      'The King\'s Gambit (1.e4 e5 2.f4) is one of the oldest and most romantic openings in chess. ' +
      'White sacrifices a pawn to open the f-file and accelerate development toward the Black king. ' +
      'If Black accepts with 2...exf4, White gets rapid development and attacking chances. ' +
      'Though less common at the top level today, it remains a powerful weapon in rapid and blitz games.',
  },
  {
    id: 'opening-queens-indian',
    category: 'opening',
    title: 'Queen\'s Indian Defense',
    content:
      'The Queen\'s Indian (1.d4 Nf6 2.c4 e6 3.Nf3 b6) is a solid, flexible defense against 1.d4. ' +
      'Black fianchettoes the queen\'s bishop to control the e4 square from a distance. ' +
      'It avoids the sharp complications of the Nimzo-Indian while maintaining a sound position. ' +
      'This opening is popular among positional players who value long-term strategic play.',
  },

  // ═══════════════════════════════════════════════════════════════════
  // TACTICAL MOTIFS (15 entries)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'tactic-fork',
    category: 'tactic',
    title: 'Fork (Double Attack)',
    content:
      'A fork is a tactic where a single piece attacks two or more enemy pieces simultaneously. ' +
      'Knight forks are the most common because the knight\'s unique movement makes them hard to see. ' +
      'The most devastating fork is a royal fork — checking the king while attacking the queen. ' +
      'Always check if your knights can reach squares that attack multiple high-value targets.',
  },
  {
    id: 'tactic-pin',
    category: 'tactic',
    title: 'Pin',
    content:
      'A pin occurs when an attacking piece threatens a less valuable piece that cannot move because it would expose ' +
      'a more valuable piece behind it. An absolute pin (against the king) means the pinned piece literally cannot move. ' +
      'A relative pin (against the queen or rook) means moving the pinned piece is legal but costly. ' +
      'Bishops and rooks are the primary pinning pieces.',
  },
  {
    id: 'tactic-skewer',
    category: 'tactic',
    title: 'Skewer',
    content:
      'A skewer is the reverse of a pin — the more valuable piece is in front and must move, exposing a less valuable piece behind it. ' +
      'A common example is a bishop or rook checking the king, forcing it to move and winning the queen behind it. ' +
      'Skewers along the back rank are particularly powerful in endgames. ' +
      'Always watch for skewer opportunities along ranks, files, and diagonals.',
  },
  {
    id: 'tactic-discovered-attack',
    category: 'tactic',
    title: 'Discovered Attack',
    content:
      'A discovered attack occurs when a piece moves out of the way, revealing an attack by another piece behind it. ' +
      'A discovered check is especially powerful because the moved piece can attack freely while the opponent deals with check. ' +
      'The most deadly form is a double check, where both the moving piece and the revealed piece give check simultaneously. ' +
      'Double checks can only be met by moving the king.',
  },
  {
    id: 'tactic-back-rank',
    category: 'tactic',
    title: 'Back-Rank Mate',
    content:
      'A back-rank mate occurs when a rook or queen checkmates the king on the first (or eighth) rank because the king is ' +
      'trapped behind its own pawns. This pattern is one of the most common tactical themes in practical play. ' +
      'To prevent back-rank mates, create a "luft" (escape square) by pushing one of the pawns in front of the king. ' +
      'Always be aware of back-rank weaknesses, especially in queen and rook endgames.',
  },
  {
    id: 'tactic-deflection',
    category: 'tactic',
    title: 'Deflection',
    content:
      'Deflection is a tactic that forces a defending piece away from a critical square or defensive duty. ' +
      'By attacking the defender directly, you force it to abandon its post, allowing a winning move elsewhere. ' +
      'A common example is deflecting a piece that guards against back-rank mate. ' +
      'Deflection often works in combination with other tactics like pins and forks.',
  },
  {
    id: 'tactic-overloaded-piece',
    category: 'tactic',
    title: 'Overloaded Piece',
    content:
      'An overloaded piece is one that has too many defensive responsibilities — it cannot handle them all simultaneously. ' +
      'By attacking one of the targets it defends, you force it to abandon the other. ' +
      'Recognizing overloaded defenders is a key tactical skill that separates intermediate players from advanced ones. ' +
      'Rooks and queens are often overloaded because they defend along multiple lines.',
  },
  {
    id: 'tactic-trapped-piece',
    category: 'tactic',
    title: 'Trapped Piece',
    content:
      'A trapped piece is one that has no safe squares to move to and can be captured. ' +
      'Bishops are frequently trapped on the edge of the board (e.g., a bishop on a7 blocked by pawns). ' +
      'Knights can be trapped in corners where they have limited mobility. ' +
      'Watch for opportunities to restrict your opponent\'s pieces and gradually take away their escape squares.',
  },
  {
    id: 'tactic-zwischenzug',
    category: 'tactic',
    title: 'Zwischenzug (Intermediate Move)',
    content:
      'A zwischenzug (German for "in-between move") is an unexpected move inserted before the expected recapture or response. ' +
      'Instead of recapturing immediately, you play a stronger move (often a check) first. ' +
      'This tactic can completely change the evaluation of a position by gaining an extra tempo. ' +
      'Always ask "Do I have to recapture right now, or is there something better?"',
  },
  {
    id: 'tactic-sacrifice',
    category: 'tactic',
    title: 'Sacrifice',
    content:
      'A sacrifice involves deliberately giving up material (a piece or pawns) for a non-material advantage like a mating attack, ' +
      'positional dominance, or decisive initiative. Classical sacrifices on h7 (the Greek Gift) and f7 are well-known patterns. ' +
      'The key is calculating whether the compensation is sufficient — look for forcing moves (checks, captures, threats). ' +
      'A sound sacrifice considers all defensive resources the opponent has.',
  },
  {
    id: 'tactic-x-ray',
    category: 'tactic',
    title: 'X-Ray Attack',
    content:
      'An X-ray attack (also called "seeing through pieces") is when a piece exerts influence through another piece on the same line. ' +
      'For example, a rook on e1 may X-ray through a piece on e4 to influence e8. ' +
      'This concept is important for calculating tactics involving pieces lined up on the same file, rank, or diagonal. ' +
      'X-ray defense is the same concept applied defensively.',
  },
  {
    id: 'tactic-removing-defender',
    category: 'tactic',
    title: 'Removing the Defender',
    content:
      'Removing the defender involves capturing or driving away a key defensive piece, leaving a target unprotected. ' +
      'This differs from deflection in that the defender is actually eliminated, not just lured away. ' +
      'Exchange sacrifices (giving a rook for a knight or bishop) often serve this purpose. ' +
      'Before executing a combination, always identify which pieces are defending the critical squares.',
  },
  {
    id: 'tactic-clearance-sacrifice',
    category: 'tactic',
    title: 'Clearance Sacrifice',
    content:
      'A clearance sacrifice removes one of your own pieces from a square so that another piece can use it more effectively. ' +
      'For example, sacrificing a knight on e5 to open the e-file for your rook. ' +
      'These sacrifices are often surprising because they seem to weaken your own position at first glance. ' +
      'Clearance is a key theme in many famous attacking combinations.',
  },
  {
    id: 'tactic-windmill',
    category: 'tactic',
    title: 'Windmill Tactic',
    content:
      'The windmill is a devastating tactical pattern involving alternating discovered checks and captures. ' +
      'A classic windmill uses a rook and bishop: the rook gives discovered check, captures a piece, then the bishop checks again. ' +
      'The most famous windmill was Torre vs. Lasker (1925), where White won massive material. ' +
      'Windmills are rare but spectacular and nearly impossible to defend against once they start.',
  },
  {
    id: 'tactic-desperado',
    category: 'tactic',
    title: 'Desperado',
    content:
      'A desperado is a piece that is going to be lost anyway, so it captures the most valuable enemy piece it can before dying. ' +
      'If your piece is attacked and cannot be saved, look for ways to trade it for maximum value first. ' +
      'This concept is particularly important in complex positions with multiple captures available. ' +
      'Always consider desperado opportunities before accepting material loss passively.',
  },

  // ═══════════════════════════════════════════════════════════════════
  // ENDGAME CONCEPTS (10 entries)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'endgame-opposition',
    category: 'endgame',
    title: 'Opposition in King and Pawn Endgames',
    content:
      'Opposition is when two kings face each other with one square between them on the same rank, file, or diagonal. ' +
      'The player NOT to move has the opposition, which is usually an advantage because the opposing king must give way. ' +
      'In king and pawn endgames, having the opposition often determines whether a pawn can promote. ' +
      'Distant opposition (kings separated by 3 or 5 squares on the same line) follows the same principle.',
  },
  {
    id: 'endgame-zugzwang',
    category: 'endgame',
    title: 'Zugzwang',
    content:
      'Zugzwang is a situation where every possible move worsens the player\'s position — they would prefer to pass. ' +
      'This concept occurs most frequently in king and pawn endgames and bishop endgames. ' +
      'Putting your opponent in zugzwang is a powerful endgame technique that can win otherwise drawn positions. ' +
      'Mutual zugzwang (where whoever moves loses) is a rare and fascinating concept.',
  },
  {
    id: 'endgame-passed-pawns',
    category: 'endgame',
    title: 'Passed Pawns',
    content:
      'A passed pawn is a pawn with no opposing pawns in front of it on the same file or adjacent files. ' +
      'Passed pawns grow stronger as pieces are exchanged and the endgame approaches. ' +
      'A protected passed pawn (supported by another pawn) is a major asset. ' +
      'The principle "passed pawns must be pushed" emphasizes their potential to promote.',
  },
  {
    id: 'endgame-rook-endgames',
    category: 'endgame',
    title: 'Rook Endgame Principles',
    content:
      'Rook endgames are the most common endgame type and require specific knowledge. ' +
      'Key principles: rooks belong behind passed pawns (yours or the opponent\'s), the Lucena position is a standard win, ' +
      'and the Philidor position is a standard draw. ' +
      'Activity of the rook is more important than material — an active rook is worth more than a passive rook with an extra pawn.',
  },
  {
    id: 'endgame-king-activity',
    category: 'endgame',
    title: 'King Activation in Endgames',
    content:
      'In the endgame, the king transforms from a piece that needs protection into a powerful attacking piece. ' +
      'Centralizing the king quickly is often the most important priority when transitioning to an endgame. ' +
      'A centralized king can support passed pawns, attack enemy pawns, and control key squares. ' +
      'The principle "bring the king to the center" is one of the most important endgame guidelines.',
  },
  {
    id: 'endgame-bishop-vs-knight',
    category: 'endgame',
    title: 'Bishop vs Knight Endgames',
    content:
      'In bishop vs knight endgames, the bishop is generally stronger in open positions with pawns on both sides of the board. ' +
      'The knight excels in closed positions and when the pawns are on one side of the board. ' +
      'A knight can be trapped in the corner, while a bishop can control squares from a distance. ' +
      'The "wrong-colored bishop" (cannot control the promotion square) is a common drawing theme.',
  },
  {
    id: 'endgame-tablebase',
    category: 'endgame',
    title: 'Basic Checkmate Patterns',
    content:
      'Every chess player should know the basic checkmates: King + Queen vs King, King + Rook vs King, and King + 2 Bishops vs King. ' +
      'The Queen mate uses a technique of restricting the enemy king to the edge of the board step by step. ' +
      'The Rook mate uses opposition and systematic restriction to drive the king to the edge. ' +
      'King + Bishop + Knight vs King is the most difficult basic mate and requires precise technique.',
  },
  {
    id: 'endgame-pawn-race',
    category: 'endgame',
    title: 'Pawn Races and Counting',
    content:
      'In endgames where both sides have passed pawns racing to promote, precise counting of tempos is critical. ' +
      'Count the number of moves needed for each pawn to promote — the faster pawn wins unless there are checks after promotion. ' +
      'Creating a passed pawn by sacrificing one pawn to push another through (the "breakthrough") is a key technique. ' +
      'A queen vs pawn on the 7th rank is usually winning for the queen, except on the a, c, f, and h files.',
  },
  {
    id: 'endgame-fortress',
    category: 'endgame',
    title: 'Fortress Defense',
    content:
      'A fortress is a defensive setup where the weaker side creates an impregnable position despite being down material. ' +
      'Classic fortresses include rook vs rook and bishop (draw) and blocked pawn positions where the stronger side cannot break through. ' +
      'Recognizing fortress possibilities helps you know when to simplify into a drawable position. ' +
      'Modern engines sometimes fail to recognize fortresses, making this a uniquely human skill.',
  },
  {
    id: 'endgame-square-rule',
    category: 'endgame',
    title: 'The Square of the Pawn',
    content:
      'The "square of the pawn" is a simple method to determine if a king can catch a passed pawn without calculation. ' +
      'Draw a diagonal from the pawn to the promotion rank — the square formed by this diagonal is the "square." ' +
      'If the opposing king can step into this square, it catches the pawn; otherwise the pawn promotes. ' +
      'This rule eliminates the need to count tempos in simple king vs pawn races.',
  },

  // ═══════════════════════════════════════════════════════════════════
  // STRATEGIC CONCEPTS (10 entries)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'strategy-pawn-structure',
    category: 'strategy',
    title: 'Pawn Structure',
    content:
      'Pawn structure is the skeleton of a chess position — it determines where pieces belong and what plans to pursue. ' +
      'Doubled pawns are generally weak because they cannot protect each other and block the file for rooks. ' +
      'Isolated pawns lack support from adjacent pawns but can be strong if actively supported by pieces. ' +
      'Understanding pawn structures is essential for choosing the right plan in any position.',
  },
  {
    id: 'strategy-piece-activity',
    category: 'strategy',
    title: 'Piece Activity and Coordination',
    content:
      'Active pieces that control key squares and have multiple options are more valuable than passive pieces stuck defending. ' +
      'Piece coordination — having your pieces work together toward a common goal — is a hallmark of strong play. ' +
      'A well-coordinated army of minor pieces can overpower a queen. ' +
      'Always ask: "Which of my pieces is the least active, and how can I improve it?"',
  },
  {
    id: 'strategy-space-advantage',
    category: 'strategy',
    title: 'Space Advantage',
    content:
      'A space advantage means your pawns control more territory, giving your pieces more room to maneuver. ' +
      'The side with more space can reposition pieces more easily while the cramped side struggles to coordinate. ' +
      'However, overextension (pushing pawns too far without support) can create weaknesses. ' +
      'When you have less space, trading pieces can relieve the pressure and equalize.',
  },
  {
    id: 'strategy-weak-squares',
    category: 'strategy',
    title: 'Weak Squares and Outposts',
    content:
      'A weak square is one that cannot be defended by pawns — it becomes a potential outpost for enemy pieces. ' +
      'A knight on an outpost (a weak square in enemy territory protected by your pawn) is extremely powerful. ' +
      'Creating weak squares in the opponent\'s camp is a key strategic goal, often achieved by pawn exchanges. ' +
      'Holes in the pawn structure, especially around the king, are particularly dangerous.',
  },
  {
    id: 'strategy-open-files',
    category: 'strategy',
    title: 'Open Files and Rook Play',
    content:
      'An open file (no pawns on it) is a highway for rooks to penetrate into the enemy position. ' +
      'A semi-open file (only enemy pawns on it) can be used to pressure the enemy pawn. ' +
      'Doubling rooks on an open file multiplies their power — the second rook supports the first. ' +
      'Control of the 7th rank with a rook is often decisive, attacking pawns and restricting the enemy king.',
  },
  {
    id: 'strategy-bishop-pair',
    category: 'strategy',
    title: 'The Bishop Pair Advantage',
    content:
      'Having both bishops (the "bishop pair") is generally an advantage, especially in open positions. ' +
      'Two bishops can control both colors of squares and coordinate to create powerful long-range attacks. ' +
      'The bishop pair becomes stronger as the position opens up and pawns are exchanged. ' +
      'When facing the bishop pair, try to keep the position closed and trade one of the bishops.',
  },
  {
    id: 'strategy-prophylaxis',
    category: 'strategy',
    title: 'Prophylactic Thinking',
    content:
      'Prophylaxis means anticipating your opponent\'s plan and preventing it before it happens. ' +
      'Before making a move, ask: "What does my opponent want to do?" Then consider stopping that plan. ' +
      'Prophylactic moves are a hallmark of great players like Karpov and Petrosian. ' +
      'Sometimes the best move is not an active one but a quiet move that takes away the opponent\'s best option.',
  },
  {
    id: 'strategy-development',
    category: 'strategy',
    title: 'Piece Development Principles',
    content:
      'In the opening, rapid and harmonious piece development is the primary goal. ' +
      'Key principles: develop knights before bishops, castle early, don\'t move the same piece twice without good reason, ' +
      'and don\'t bring the queen out too early. Control the center with pawns and pieces. ' +
      'Each move should serve a purpose — developing a piece, controlling the center, or preparing castling.',
  },
  {
    id: 'strategy-tempo',
    category: 'strategy',
    title: 'Tempo and Time in Chess',
    content:
      'A tempo is a unit of time in chess — essentially one move. Gaining or losing tempos can be critical. ' +
      'Developing a piece with a threat (attacking something) is gaining a tempo because the opponent must respond. ' +
      'Moving a piece to a square it will have to leave wastes a tempo. ' +
      'In gambit openings, material is sacrificed for tempos — faster development and initiative.',
  },
  {
    id: 'strategy-exchanges',
    category: 'strategy',
    title: 'When to Exchange Pieces',
    content:
      'Piece exchanges should be purposeful, not automatic. Exchange pieces when you have a space disadvantage (relieves cramping), ' +
      'when you are ahead in material (simplify to an easier win), or when removing a key enemy piece. ' +
      'Avoid exchanges when you have an attack — more pieces mean more attacking potential. ' +
      'The principle "exchange bad pieces for good ones" is a powerful strategic guideline.',
  },

  // ═══════════════════════════════════════════════════════════════════
  // COMMON MISTAKES (5 entries as bonus)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'mistake-hanging-pieces',
    category: 'mistake',
    title: 'Hanging Pieces',
    content:
      'A hanging piece is an undefended piece that can be captured for free. Blundering hanging pieces is the number one ' +
      'cause of losses for beginners and intermediate players. Before every move, use a simple blunder check: ' +
      '"Does my move leave any of my pieces undefended?" Develop the habit of scanning the entire board for hanging pieces.',
  },
  {
    id: 'mistake-premature-attack',
    category: 'mistake',
    title: 'Premature Attack',
    content:
      'Launching an attack before development is complete is one of the most common strategic mistakes. ' +
      'An attack with only a few pieces is easy to repel, and the attacking side often falls behind in development. ' +
      'Follow the guideline: attack only when you have a lead in development or a structural advantage. ' +
      'A premature queen sortie (e.g., Scholar\'s Mate attempts) is easily punished by experienced players.',
  },
  {
    id: 'mistake-weak-back-rank',
    category: 'mistake',
    title: 'Neglecting Back-Rank Safety',
    content:
      'Forgetting to create an escape square (luft) for the king is a common oversight that leads to back-rank mates. ' +
      'After castling, always consider whether you need to play h3/h6 or a3/a6 to give the king breathing room. ' +
      'This is especially important when queens and rooks are still on the board. ' +
      'Many games between intermediate players are decided by back-rank tactics.',
  },
  {
    id: 'mistake-ignoring-center',
    category: 'mistake',
    title: 'Ignoring the Center',
    content:
      'Playing too many moves on the wings while neglecting central control is a fundamental strategic error. ' +
      'The center is the most important area of the board — pieces in the center control the most squares. ' +
      'Flank attacks are usually only justified when you already have a strong center. ' +
      'The classical advice "occupy the center with pawns, then develop pieces to support it" remains valid.',
  },
  {
    id: 'mistake-time-trouble',
    category: 'mistake',
    title: 'Time Management',
    content:
      'Poor clock management leads to time pressure, which dramatically increases blunder rates. ' +
      'Spend more time on critical positions (complex tactics, turning points) and less on obvious moves. ' +
      'Don\'t try to calculate every variation to the end — develop intuition and pattern recognition. ' +
      'If you\'re in time trouble, prioritize king safety and play solid, simple moves.',
  },
];

module.exports = chessKnowledge;
