/**
 * @fileoverview Dots and Boxes AI Implementation
 * 
 * Provides AI opponents with different difficulty levels and strategic thinking
 * for the Dots and Boxes game.
 */

import type { GameState, AIDifficulty, Result } from '@gpg/shared';
import type { 
  DotsAndBoxesMove, 
  DotsAndBoxesMetadata, 
  MoveEvaluation, 
  AIHint
} from './types';
import { DotsAndBoxesEngine } from './engine';

export class DotsAndBoxesAI {
  private engine = new DotsAndBoxesEngine();

  /**
   * Get the best move for the AI at the given difficulty level
   */
  async getMove(
    gameState: GameState, 
    difficulty: AIDifficulty, 
    playerId: string
  ): Promise<Result<DotsAndBoxesMove>> {
    const availableMoves = this.engine.getAvailableMoves(gameState);
    
    if (availableMoves.length === 0) {
      return { success: false, error: 'No available moves' };
    }

    // Update move player IDs
    const movesWithPlayer = availableMoves.map(move => ({
      ...move,
      playerId,
      data: { ...move.data, playerId }
    }));

    let selectedMove: DotsAndBoxesMove;

    switch (difficulty) {
      case 1: // Beginner - Random moves
        selectedMove = this.getRandomMove(movesWithPlayer);
        break;
      
      case 2: // Easy - Prefer safe moves, avoid giving away boxes
        selectedMove = await this.getEasyMove(gameState, movesWithPlayer);
        break;
      
      case 3: // Medium - Basic strategy with box completion
        selectedMove = await this.getMediumMove(gameState, movesWithPlayer);
        break;
      
      case 4: // Hard - Strategic play with chain awareness
        selectedMove = await this.getHardMove(gameState, movesWithPlayer);
        break;
      
      case 5: // Expert - Advanced strategy with look-ahead
        selectedMove = await this.getExpertMove(gameState, movesWithPlayer);
        break;
      
      case 6: // Master - Near optimal play
        selectedMove = await this.getMasterMove(gameState, movesWithPlayer);
        break;
      
      default:
        selectedMove = this.getRandomMove(movesWithPlayer);
    }

    return { success: true, data: selectedMove };
  }

  /**
   * Provide a hint for human players
   */
  async getHint(gameState: GameState, playerId: string): Promise<AIHint | null> {
    const availableMoves = this.engine.getAvailableMoves(gameState);
    
    if (availableMoves.length === 0) {
      return null;
    }

    const movesWithPlayer = availableMoves.map(move => ({
      ...move,
      playerId,
      data: { ...move.data, playerId }
    }));

    // Use medium-level strategy for hints
    const bestMove = await this.getMediumMove(gameState, movesWithPlayer);
    const evaluation = this.evaluateMove(gameState, bestMove);
    
    return {
      move: bestMove,
      explanation: this.generateHintExplanation(evaluation),
      confidence: evaluation.confidence,
      strategicReason: this.determineStrategicReason(evaluation)
    };
  }

  // ============================================================================
  // DIFFICULTY-SPECIFIC STRATEGIES
  // ============================================================================

  private getRandomMove(moves: DotsAndBoxesMove[]): DotsAndBoxesMove {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  private async getEasyMove(gameState: GameState, moves: DotsAndBoxesMove[]): Promise<DotsAndBoxesMove> {
    // Avoid moves that give away boxes, prefer safe moves
    const evaluations = moves.map(move => this.evaluateMove(gameState, move));
    
    // Filter out moves that give away boxes
    const safeMoves = evaluations.filter(evaluation => evaluation.giveawayBoxes === 0);
    
    if (safeMoves.length > 0) {
      // Pick randomly from safe moves
      const randomSafe = safeMoves[Math.floor(Math.random() * safeMoves.length)];
      return randomSafe.move;
    }
    
    // If no safe moves, pick the least harmful
    evaluations.sort((a, b) => a.giveawayBoxes - b.giveawayBoxes);
    return evaluations[0].move;
  }

  private async getMediumMove(gameState: GameState, moves: DotsAndBoxesMove[]): Promise<DotsAndBoxesMove> {
    const evaluations = moves.map(move => this.evaluateMove(gameState, move));
    
    // Priority: 1. Complete boxes, 2. Avoid giveaways, 3. Strategic value
    evaluations.sort((a, b) => {
      // Prioritize immediate box completions
      if (a.immediateBoxes !== b.immediateBoxes) {
        return b.immediateBoxes - a.immediateBoxes;
      }
      
      // Avoid giving away boxes
      if (a.giveawayBoxes !== b.giveawayBoxes) {
        return a.giveawayBoxes - b.giveawayBoxes;
      }
      
      // Higher strategic value
      return b.strategicValue - a.strategicValue;
    });
    
    return evaluations[0].move;
  }

  private async getHardMove(gameState: GameState, moves: DotsAndBoxesMove[]): Promise<DotsAndBoxesMove> {
    const evaluations = moves.map(move => this.evaluateMove(gameState, move));
    const analysis = this.engine.analyzeGameState(gameState);
    
    // Advanced strategy considering chains and endgame
    evaluations.forEach(evaluation => {
      // Boost score for chain setups
      if (analysis.chainPotential > 0) {
        evaluation.strategicValue += this.calculateChainValue(gameState, evaluation.move);
      }
      
      // Endgame considerations
      const boxesLeft = analysis.totalBoxes - analysis.completedBoxes;
      if (boxesLeft <= 6) {
        evaluation.strategicValue += this.calculateEndgameValue(gameState, evaluation.move);
      }
    });
    
    // Sort by overall score
    evaluations.sort((a, b) => b.score - a.score);
    return evaluations[0].move;
  }

  private async getExpertMove(gameState: GameState, moves: DotsAndBoxesMove[]): Promise<DotsAndBoxesMove> {
    // Use minimax with limited depth
    return this.minimaxMove(gameState, moves, 2);
  }

  private async getMasterMove(gameState: GameState, moves: DotsAndBoxesMove[]): Promise<DotsAndBoxesMove> {
    // Use deeper minimax with advanced evaluation
    return this.minimaxMove(gameState, moves, 3);
  }

  // ============================================================================
  // MOVE EVALUATION
  // ============================================================================

  private evaluateMove(gameState: GameState, move: DotsAndBoxesMove): MoveEvaluation {
    // Simulate the move to see immediate effects
    const moveResult = this.engine.applyMove(gameState, move);
    
    if (!moveResult.success) {
      return {
        move,
        score: -1000,
        immediateBoxes: 0,
        giveawayBoxes: 0,
        strategicValue: 0,
        confidence: 0,
        reasoning: 'Invalid move'
      };
    }

    const newState = moveResult.data;
    const newMetadata = newState.metadata as DotsAndBoxesMetadata;
    const immediateBoxes = newMetadata.lastMoveCompletedBoxes;
    
    // Calculate how many boxes this move gives to opponent
    const giveawayBoxes = this.calculateGiveawayBoxes(newState);
    
    // Calculate strategic value
    const strategicValue = this.calculateStrategicValue(gameState, newState, move);
    
    // Overall score
    const score = (immediateBoxes * 100) - (giveawayBoxes * 80) + strategicValue;
    
    return {
      move,
      score,
      immediateBoxes,
      giveawayBoxes,
      strategicValue,
      confidence: Math.min(100, Math.max(0, score + 50)) / 100,
      reasoning: this.generateReasoning(immediateBoxes, giveawayBoxes, strategicValue)
    };
  }

  private calculateGiveawayBoxes(gameState: GameState): number {
    // Count boxes that opponent can complete in their next turn
    const analysis = this.engine.analyzeGameState(gameState);
    return analysis.completableBoxes.length;
  }

  private calculateStrategicValue(
    _oldState: GameState, 
    newState: GameState, 
    move: DotsAndBoxesMove
  ): number {
    let value = 0;
    
    // Prefer moves toward center
    const metadata = newState.metadata as DotsAndBoxesMetadata;
    const { width, height } = metadata.gridSize;
    const centerX = width / 2;
    const centerY = height / 2;
    const distance = Math.sqrt(
      Math.pow(move.position.col - centerX, 2) + 
      Math.pow(move.position.row - centerY, 2)
    );
    value += (10 - distance); // Closer to center is better
    
    // Avoid creating 3-sided boxes (dangerous)
    const analysis = this.engine.analyzeGameState(newState);
    value -= analysis.completableBoxes.length * 15;
    
    // Prefer moves that don't affect many boxes
    const affectedBoxes = this.countAffectedBoxes(move, metadata);
    value -= affectedBoxes * 5;
    
    return value;
  }

  private calculateChainValue(gameState: GameState, move: DotsAndBoxesMove): number {
    // Simplified chain value calculation
    const moveResult = this.engine.applyMove(gameState, move);
    if (!moveResult.success) return 0;
    
    const analysis = this.engine.analyzeGameState(moveResult.data);
    return analysis.chainPotential * 10;
  }

  private calculateEndgameValue(gameState: GameState, move: DotsAndBoxesMove): number {
    // In endgame, prioritize moves that complete chains or force opponent
    const moveResult = this.engine.applyMove(gameState, move);
    if (!moveResult.success) return 0;
    
    const metadata = moveResult.data.metadata as DotsAndBoxesMetadata;
    if (metadata.lastMoveCompletedBoxes > 0) {
      return 25; // Completing boxes in endgame is valuable
    }
    
    return 0;
  }

  private countAffectedBoxes(move: DotsAndBoxesMove, metadata: DotsAndBoxesMetadata): number {
    // Count how many boxes this line affects
    const { row, col } = move.position;
    const { lineType } = move.data;
    let count = 0;
    
    if (lineType === 'horizontal') {
      // Check boxes above and below
      if (row > 0) count++;
      if (row < metadata.gridSize.height - 1) count++;
    } else {
      // Check boxes left and right
      if (col > 0) count++;
      if (col < metadata.gridSize.width - 1) count++;
    }
    
    return count;
  }

  // ============================================================================
  // MINIMAX IMPLEMENTATION
  // ============================================================================

  private minimaxMove(gameState: GameState, moves: DotsAndBoxesMove[], depth: number): DotsAndBoxesMove {
    let bestMove = moves[0];
    let bestScore = -Infinity;
    
    for (const move of moves) {
      const moveResult = this.engine.applyMove(gameState, move);
      if (!moveResult.success) continue;
      
      const score = this.minimax(moveResult.data, depth - 1, false, -Infinity, Infinity);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    
    return bestMove;
  }

  private minimax(
    gameState: GameState, 
    depth: number, 
    isMaximizing: boolean, 
    alpha: number, 
    beta: number
  ): number {
    const terminal = this.engine.isTerminal(gameState);
    
    if (terminal || depth === 0) {
      return this.evaluatePosition(gameState, isMaximizing);
    }
    
    const moves = this.engine.getAvailableMoves(gameState);
    
    if (isMaximizing) {
      let maxScore = -Infinity;
      
      for (const move of moves) {
        const moveResult = this.engine.applyMove(gameState, move);
        if (!moveResult.success) continue;
        
        const score = this.minimax(moveResult.data, depth - 1, false, alpha, beta);
        maxScore = Math.max(maxScore, score);
        alpha = Math.max(alpha, score);
        
        if (beta <= alpha) break; // Alpha-beta pruning
      }
      
      return maxScore;
    } else {
      let minScore = Infinity;
      
      for (const move of moves) {
        const moveResult = this.engine.applyMove(gameState, move);
        if (!moveResult.success) continue;
        
        const score = this.minimax(moveResult.data, depth - 1, true, alpha, beta);
        minScore = Math.min(minScore, score);
        beta = Math.min(beta, score);
        
        if (beta <= alpha) break; // Alpha-beta pruning
      }
      
      return minScore;
    }
  }

  private evaluatePosition(gameState: GameState, isMaximizing: boolean): number {
    const metadata = gameState.metadata as DotsAndBoxesMetadata;
    const [aiScore, humanScore] = metadata.playerScores;
    
    // Terminal position evaluation
    const terminal = this.engine.isTerminal(gameState);
    if (terminal) {
      if (terminal.winner === gameState.players[0].id) {
        return isMaximizing ? 1000 : -1000;
      } else if (terminal.winner === gameState.players[1].id) {
        return isMaximizing ? -1000 : 1000;
      } else {
        return 0; // Draw
      }
    }
    
    // Position evaluation based on score difference and strategic factors
    const scoreDiff = aiScore - humanScore;
    const analysis = this.engine.analyzeGameState(gameState);
    
    let evaluation = scoreDiff * 10;
    evaluation -= analysis.completableBoxes.length * 5; // Avoid giving away boxes
    evaluation += analysis.safeBoxes.length * 2; // Value safe development
    
    return isMaximizing ? evaluation : -evaluation;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private generateReasoning(immediateBoxes: number, giveawayBoxes: number, strategicValue: number): string {
    if (immediateBoxes > 0) {
      return `Completes ${immediateBoxes} box${immediateBoxes > 1 ? 'es' : ''} immediately`;
    }
    
    if (giveawayBoxes > 0) {
      return `Gives opponent ${giveawayBoxes} completable box${giveawayBoxes > 1 ? 'es' : ''}`;
    }
    
    if (strategicValue > 10) {
      return 'Good strategic positioning';
    } else if (strategicValue < -10) {
      return 'Creates dangerous position';
    }
    
    return 'Neutral move';
  }

  private generateHintExplanation(evaluation: MoveEvaluation): string {
    const { immediateBoxes, giveawayBoxes, strategicValue } = evaluation;
    
    if (immediateBoxes > 0) {
      return `This move completes ${immediateBoxes} box${immediateBoxes > 1 ? 'es' : ''} and gives you another turn!`;
    }
    
    if (giveawayBoxes > 0) {
      return `Be careful - this move allows your opponent to complete ${giveawayBoxes} box${giveawayBoxes > 1 ? 'es' : ''}.`;
    }
    
    if (strategicValue > 10) {
      return 'This is a safe move that maintains good positioning.';
    }
    
    return 'This move has neutral strategic value.';
  }

  private determineStrategicReason(evaluation: MoveEvaluation): AIHint['strategicReason'] {
    if (evaluation.immediateBoxes > 0) return 'box_completion';
    if (evaluation.giveawayBoxes > 0) return 'defensive';
    if (evaluation.strategicValue > 10) return 'chain_setup';
    if (evaluation.strategicValue < -10) return 'defensive';
    return 'safe_move';
  }
}