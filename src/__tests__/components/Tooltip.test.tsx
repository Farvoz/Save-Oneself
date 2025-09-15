import { render, screen } from '@testing-library/react';
import { Tooltip } from '../../components/Tooltip';

describe('Tooltip', () => {
    it('should render tooltip when visible is true', () => {
        render(
            <Tooltip 
                text="Test tooltip text"
                position={{ row: 0, col: 0 }}
                visible={true}
            />
        );
        
        expect(screen.getByText('Test tooltip text')).toBeInTheDocument();
    });

    it('should not render tooltip when visible is false', () => {
        render(
            <Tooltip 
                text="Test tooltip text"
                position={{ row: 0, col: 0 }}
                visible={false}
            />
        );
        
        expect(screen.queryByText('Test tooltip text')).not.toBeInTheDocument();
    });

    it('should have correct positioning styles', () => {
        render(
            <Tooltip 
                text="Test tooltip text"
                position={{ row: 1, col: 2 }}
                visible={true}
            />
        );
        
        const tooltip = screen.getByText('Test tooltip text').closest('.tooltip');
        expect(tooltip).toHaveStyle({
            left: '650px', // (2 + 4) * 100 + 50 = 650px
            top: '500px'   // (1 + 4) * 100 + 50 - 50 = 500px
        });
    });
});
