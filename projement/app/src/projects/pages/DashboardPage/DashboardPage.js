import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Table, Badge } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

import { Spinner } from 'core';
import {
    fetchProjects,
    getProjects,
    getIsLoading,
} from 'projects/ducks/projects';
import { projectType, pageType } from 'projects/propTypes';
import { getPage } from '../../ducks/projects';
import PaginationComponent from '../../../core/PaginationComponent';

const DashboardPage = ({
    fetchProjects,
    projects,
    isLoading,
    page: { currentPage, totalPageCounts, count },
}) => {
    useEffect(() => {
        fetchProjects(currentPage, totalPageCounts);
    }, [currentPage, fetchProjects, totalPageCounts]);

    if (isLoading) {
        return <Spinner />;
    }

    const calculateProjectHasEnded = project => {
        return new Date(project.start_date).getDay() === new Date().getDay();
    };

    return (
        <>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Project</th>
                        <th>Tags</th>
                        <th>Company</th>
                        <th>Estimated</th>
                        <th>Actual</th>
                    </tr>
                </thead>
                <tbody>
                    {projects.map((project, i) => (
                        <tr key={project.id}>
                            <td data-testid={`project-title-${i}`}>
                                <Link to={`/projects/${project.id}`}>
                                    {calculateProjectHasEnded(project) ? (
                                        <s>{project.title}</s>
                                    ) : (
                                        project.title
                                    )}
                                </Link>
                                {project.is_over_budget && (
                                    <Badge
                                        color="danger"
                                        className="ml-2"
                                        data-testid="over-budget-badge"
                                    >
                                        <FontAwesomeIcon icon={faClock} />
                                    </Badge>
                                )}
                            </td>
                            <td data-testid={`project-tags-${i}`}>
                                {project.tags.map(tag => (
                                    <Badge
                                        key={tag.id}
                                        color={tag.color}
                                        className="mr-2"
                                    >
                                        {tag.name}
                                    </Badge>
                                ))}
                            </td>
                            <td data-testid={`project-company-name-${i}`}>
                                {project.company.name}
                            </td>
                            <td data-testid={`project-estimated-hours-${i}`}>
                                {project.total_estimated_hours}
                            </td>
                            <td data-testid={`project-actual-hours-${i}`}>
                                {project.total_actual_hours}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <PaginationComponent
                currentPage={currentPage}
                totalItemCounts={count}
                maxButtons={5}
                totalPageCounts={totalPageCounts}
                handlePageChange={page => fetchProjects(page, totalPageCounts)}
            />
        </>
    );
};

DashboardPage.propTypes = {
    fetchProjects: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    page: PropTypes.objectOf(pageType).isRequired,
    projects: PropTypes.arrayOf(projectType).isRequired,
};

const mapStateToProps = state => ({
    projects: getProjects(state),
    isLoading: getIsLoading(state),
    page: getPage(state),
});

const mapDispatchToProps = dispatch => ({
    fetchProjects: (page, page_size) =>
        dispatch(fetchProjects(page, page_size)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DashboardPage);
