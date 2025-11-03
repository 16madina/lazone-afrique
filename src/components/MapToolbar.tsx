import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Circle, 
  Pentagon, 
  Flame, 
  Grid3x3, 
  List,
  MapPin,
  Maximize2,
  RefreshCw
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type MapTool = 'circle' | 'polygon' | 'none';
export type MapDisplayMode = 'markers' | 'heatmap' | 'grid' | 'list';

interface MapToolbarProps {
  activeTool: MapTool;
  displayMode: MapDisplayMode;
  onToolChange: (tool: MapTool) => void;
  onDisplayModeChange: (mode: MapDisplayMode) => void;
  onClearSelection: () => void;
  selectedCount: number;
}

const MapToolbar = ({
  activeTool,
  displayMode,
  onToolChange,
  onDisplayModeChange,
  onClearSelection,
  selectedCount
}: MapToolbarProps) => {
  return (
    <TooltipProvider>
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-10 glass rounded-xl shadow-elevation-5 p-2 space-y-2 animate-slide-left">
        {/* Outils de sélection */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground px-2">Sélection</p>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'circle' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onToolChange(activeTool === 'circle' ? 'none' : 'circle')}
                className="w-full"
              >
                <Circle className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Sélection circulaire</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === 'polygon' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onToolChange(activeTool === 'polygon' ? 'none' : 'polygon')}
                className="w-full"
              >
                <Pentagon className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Sélection polygonale</p>
            </TooltipContent>
          </Tooltip>

          {selectedCount > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClearSelection}
                  className="w-full text-destructive hover:text-destructive"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Effacer ({selectedCount})</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <Separator />

        {/* Modes d'affichage */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground px-2">Affichage</p>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={displayMode === 'markers' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onDisplayModeChange('markers')}
                className="w-full"
              >
                <MapPin className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Marqueurs</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={displayMode === 'heatmap' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onDisplayModeChange('heatmap')}
                className="w-full"
              >
                <Flame className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Carte de chaleur</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={displayMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onDisplayModeChange('grid')}
                className="w-full"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Grille</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={displayMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onDisplayModeChange('list')}
                className="w-full"
              >
                <List className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Liste compacte</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Indicateur de sélection active */}
        {activeTool !== 'none' && (
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-16 bg-primary rounded-full animate-pulse" />
        )}
      </div>
    </TooltipProvider>
  );
};

export default MapToolbar;
